import {ProjectInfos} from "../../inertia/types/schemas.js";
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
    // Validate received data
    const receivedData: Record<string, any> = request.body()
    const {result, errors} = this.validateReceivedData(receivedData, projectInfos)
    if (!result) {
      throw new Error('The value given for run the execution are not valid. ' + errors.join('\n'))
    }

    // Create execution record
    const execution = await this.createANewExecution(projectInfos)

    // Create workspace
    logger.debug(`Creating workspace place: ${execution.workspacePath}`)
    mkdirSync(execution.workspacePath, { recursive: true });

    // copy files
    await this.copyFilesToWorkspace(
      projectInfos,
      request,
      execution.workspacePath
    )

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
      const pythonProcess = spawn(execution.pythonPath, [execution.scriptPath, ...execution.args], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: execution.workspacePath,
      })
      this.runningProcesses.set(execution.id, pythonProcess)

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
      const newList = messages.filter(message => message.timestamp >= startTime)
      logger.info(`['${execution.id}'] startTime given, filtering messages from ${startTime.toISO()}. Total messages: ${messages.length}`)
      return newList
    }

    return messages
  }

  /**
   * Useful methods
   */
  private static validateReceivedData(data: Record<string, any>, projectInfos: ProjectInfos): {result: boolean, errors: string[]} {
    const errors: string[] = []

    projectInfos.inputs.forEach((input) => {
      if (input.required && !(input.name in data)) {
        errors.push(`${input.name} is required but not provided in the data.`);
      }
    })

    return {result: errors.length === 0, errors: errors};
  }

  private static async copyFilesToWorkspace(projectInfos: ProjectInfos, request: any, workspacePath: string) {
    for (const input of projectInfos.inputs) {
      if (input.type === 'file') {
        if (input.multiple) {
          const files = request.files(input.name)
          for (const file of files) {
            if (!file.isValid) {
              throw new Error(`File ${file.clientName} is not valid.`);
            }
            await file.move(workspacePath)
          }
        } else {
          const file = request.file(input.name)
          if (!file.isValid) {
            throw new Error(`File ${input.name} is not valid.`);
          }
          await file.move(workspacePath);
        }

      }
    }
  }

  private static extractArgsFromProjectInfos(projectInfos: ProjectInfos): string[]  {
    return projectInfos.inputs.map((input) => {return input.name})
  }

  private static async createANewExecution(projectInfos: ProjectInfos,) {
    // TODO: The path management suck
    const executionId = projectInfos.name.replaceAll(' ', '-') + '_' + Date.now()
    const workspacePath = app.tmpPath(`/workspace/${executionId}`)
    const args = this.extractArgsFromProjectInfos(projectInfos)

    logger.debug(`projectInfos.path before resolve: ${projectInfos.path}`)
    const resolvedPath = path.resolve(projectInfos.path)
    logger.debug(`projectInfos.path after resolve: ${resolvedPath}`)

    // Script path manipulation
    logger.debug(`Script name without resolve: ${projectInfos.scriptName}`)
    const scriptPath = path.join(resolvedPath, projectInfos.scriptName)
    logger.debug(`Script path: ${scriptPath}`)

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
      scriptPath,
      pythonPath,
      args,
      status: 'pending',
    })
  }
}
