import {FileInputInfos, ProjectInfos} from "../../inertia/types/schemas.js";
import app from "@adonisjs/core/services/app";
import {ChildProcess, spawn} from "node:child_process";
import {existsSync, mkdirSync} from "node:fs";
import Execution from "#models/execution";
import {DateTime} from "luxon";
import logger from "@adonisjs/core/services/logger";
import SystemDetector from "#services/system_detector";
import ExecutionMessage from "#models/execution_message";
import path from "node:path";

// TODO: For now there are not protection of execution with owner. All are accessible
// TODO: Not sure is the best practise to give the request as input. Just we have to succeed to get correctly the files

// TODO: add a validation for not have special char in projectName
// TODO: How to handle if it is a option or a args

export default class ExecuteScriptService {
  private static runningProcesses = new Map<string, ChildProcess>()

  /**
   * Start a new Python script execution
   */
  static async startExecution(
    projectInfos: ProjectInfos,
    request: any
  ) {
    // Create execution record
    const execution = await this.createANewExecution(projectInfos)

    // Create workspace
    logger.debug(`Creating workspace place: ${execution.workspacePath}`)
    mkdirSync(execution.workspacePath, { recursive: true });

    // extract data
    const {args, errors} = await this.extractDataFromRequest(projectInfos, request, execution.workspacePath)
    if (errors.length > 0) {
      throw new Error('The value given for run the execution are not valid. ' + errors.join('\n'))
    }
    execution.args = args;

    // Start the process
    this.executeScript(execution)

    return execution.id
  }


  /**
   * Execute the Python script
   */
  private static async executeScript(execution: Execution) {
    try {
      // Update status to running
      execution.status = 'running'
      execution.startedAt = DateTime.now()
      await execution.save()

      logger.info(`['${execution.id}'] started at ${execution.startedAt.toISO()}`)

      // Save started message
      await execution.related('messages').create({
        content: `[From sever] Execution started at ${execution.startedAt.toISO()}`,
        timestamp: DateTime.now()
      })

      // Spawn Python process
      const pythonProcess = spawn(execution.pythonPath, [...execution.scriptPath.split(' '), ...execution.args], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: execution.workspacePath,
      })
      this.runningProcesses.set(execution.id, pythonProcess)

      // Saved cmd infos
      const cmd = pythonProcess.spawnargs.join(" ");
      logger.debug(`[${execution.id}] cmd used: ${cmd}`)
      await execution.related('messages').create({
        content: `[From sever] cmd used: ${cmd}`,
        timestamp: DateTime.now()
      })

      // Handle stdout
      pythonProcess.stdout.on('data', (data) => {
        const output = data.toString()
        logger.debug(`['${execution.id}'] new stdout data:`, output)
        execution.related('messages').create({
          content: output,
          timestamp: DateTime.now()
        })
      })

      // Handle stderr
      pythonProcess.stderr.on('data', (data) => {
        const output = data.toString()
        logger.debug(`['${execution.id}'] new stderr data:`, output)
        execution.related('messages').create({
          content: output,
          timestamp: DateTime.now()
        })
      })

      // Handle process completion
      pythonProcess.on('close', async (code) => {
        execution.status = code === 0 ? 'completed' : 'failed'
        execution.completedAt = DateTime.now()
        if (code) {
          execution.exitCode = code
        }
        await execution.save()
        logger.info(`['${execution.id}'] process closed with code: ${code}`)

        execution.related('messages').create({
          content: `[From sever] Execution completed with exit code ${code}`,
          timestamp: DateTime.now()
        })
      })

      // Handle process errors
      pythonProcess.on('error', async (error) => {
        execution.status = 'failed'
        execution.completedAt = DateTime.now()
        await execution.save()
        logger.error(`['${execution.id}'] process error:`, error)

        execution.related('messages').create({
          content: `[From sever] Execution failed with error: ${error}`,
          timestamp: DateTime.now()
        })
      })

      // TODO: Maybe we can add a timeout to the process


    } catch (error) {
      execution.status = 'failed'
      execution.completedAt = DateTime.now()
      await execution.save()
      logger.error(`['${execution.id}'] execution failed:`, error)

      execution.related('messages').create({
        content: `[From sever] Execution failed with error: ${error}`,
        timestamp: DateTime.now()
      })
    }
  }

  /**
   * Stop a running execution
   */
  static async stopExecution(execution: Execution): Promise<boolean> {
    const process = this.runningProcesses.get(execution.id)

    if (!process) {
      logger.warn(`['${execution.id}'] no running process found to stop`)
      return false
    }
    logger.info(`['${execution.id}'] stopping execution`)
    process.kill('SIGTERM')

    return true
  }

  /**
   * Get the output message of an execution
   */
  static async getExecutionMessages(execution: Execution, startTime: DateTime | null=null): Promise<ExecutionMessage[]> {
    logger.info(`['${execution.id}'] fetching execution messages`)
    const messages = await execution.related('messages').query().orderBy('timestamp', 'asc')

    if (messages.length === 0) {
      logger.warn(`['${execution.id}'] no messages found for this execution`)
    } else {
      logger.info(`['${execution.id}'] found ${messages.length} messages for this execution`)
    }

    if (startTime) {
      // Filter messages by startTime if provided
      const newList = messages.filter(message => message.timestamp.diff(startTime).milliseconds > 0)
      logger.info(`['${execution.id}'] startTime given, filtering messages from ${startTime.toISO()}. Total messages: ${messages.length}`)
      return newList
    }

    return messages
  }

  /**
   * Useful methods
   */

  private static async extractDataFromRequest(projectInfos: ProjectInfos, request: any, workspacePath: string) {
    // Return args
    const body = request.body()
    const args: string[] = []
    const errors: string[] = []

    for (const input of projectInfos.inputs) {

      if (input.required && !(input.name in body)) {
        errors.push(`${input.name} is required but not provided in the data.`);
        continue
      }
      if (!(input.name in body)) {
        continue
      }
      // TODO: check always same order
      // TODO: explain order important, it have to be in the order of wanted in the cmd
      const isOption = input.name.startsWith('-')

      if (input.type === 'file') {
        const files = await this.copyFilesToWorkspace(input, request, workspacePath)
        files.forEach((file) => {
          if (isOption) {
            args.push(input.name)
          }
          args.push(file)
        })

      } else if (input.type === 'text') {
        if (isOption) {
          args.push(input.name)
        }
        args.push(body[input.name])
      }
    }
    return {args: args, errors: errors};
  }

  private static async copyFilesToWorkspace(input: FileInputInfos, request: any, workspacePath: string) {
    const filesName: string[] = []
    if (input.multiple) {
      const files = request.files(input.name)
      for (const file of files) {
        if (!file.isValid) {
          throw new Error(`File ${file.clientName} is not valid.`);
        }
        await file.move(workspacePath)
        filesName.push(file.clientName)
      }
    } else {
      const file = request.file(input.name)
      if (!file.isValid) {
        throw new Error(`File ${input.name} is not valid.`);
      }
      await file.move(workspacePath);
      filesName.push(file.clientName)
    }
    return filesName
}

  private static async createANewExecution(projectInfos: ProjectInfos,) {
    // TODO: The path management suck
    const executionId = projectInfos.name.replaceAll(' ', '-') + '_' + Date.now()
    const workspacePath = app.tmpPath(`/workspace/${executionId}`)
    // const args = this.extractArgsFromProjectInfos(projectInfos)
    const args = [""]

    logger.debug(`projectInfos.path before resolve: ${projectInfos.path}`)
    const resolvedPath = path.resolve(projectInfos.path)
    logger.debug(`projectInfos.path after resolve: ${resolvedPath}`)

    // Script path manipulation
    // logger.debug(`Script name without resolve: ${projectInfos.scriptName}`)
    // const scriptPath = path.join(resolvedPath, projectInfos.scriptName)
    // logger.debug(`Script path: ${scriptPath}`)

    // Python path manipulation
    let pythonPath = path.join(resolvedPath, '.venv', 'Scripts', 'python')
    if (SystemDetector.isWindows) {
      pythonPath = path.join(resolvedPath, '.venv', 'Scripts', 'python.exe')
    }
    logger.debug(`Python path: ${pythonPath}`)

    // Validation of paths
    if (!existsSync(pythonPath)){
      logger.error(`Python executable not found at: ${pythonPath}`);
      throw new Error('No python found in: ' + pythonPath)
    }

    // create and save
    return await Execution.create({
      id: executionId,
      workspacePath,
      scriptPath: projectInfos.scriptName,
      pythonPath,
      args,
      status: 'pending',
    })
  }
}
