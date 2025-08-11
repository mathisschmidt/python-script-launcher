import {ProjectInfos} from "../../inertia/types/schemas.js";
import app from "@adonisjs/core/services/app";
import {ChildProcess, spawn} from "node:child_process";
import transmit from '@adonisjs/transmit/services/main';
import {existsSync} from "node:fs";

// TODO: For now there are not protection of execution with owner. All the channel are accessible
// TODO: Not sure is the best practise to give the request as input. Just we have to succeed to get correctly the files

// TODO: add a validation for not have special char in projectName
// TODO: How to handle if it is a option or a args
// TODO: Maybe Transform ScriptExecution to a class and add logic for the property executionId, workspacePath, channelName, args, scriptPath, pythonPath directly inside

export interface ScriptExecution {
  id: string
  projectInfos: ProjectInfos
  workspacePath: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'stopped'
  startedAt?: Date
  completedAt?: Date
  exitCode?: number
  channelName: string
}

export default class ExecuteScriptService {
  private static runningProcesses = new Map<string, ChildProcess>()
  private static executions = new Map<string, ScriptExecution>()

  /**
   * Start a new Python script execution
   */
  static async startExecution(
    projectInfos: ProjectInfos,
    request: any
  ): Promise<{ executionId: string; channelName: string }> {
    // Validate received data
    const receivedData: Record<string, any> = request.body()
    const {result, errors} = this.validateReceivedData(receivedData, projectInfos)
    if (!result) {
      throw new Error('The value given for run the execution are not valid. ' + errors.join('\n'))
    }
    const executionId = projectInfos.name.replaceAll(' ', '-') + '_' + Date.now()
    const workspacePath = `/workspace/${executionId}`
    const channelName = `execution/${executionId}`

    // Create execution record
    const execution: ScriptExecution = {
      id: executionId,
      projectInfos: projectInfos,
      workspacePath,
      status: 'pending',
      channelName
    }
    this.executions.set(executionId, execution)

    // copy files
    await this.copyFilesToWorkspace(
      projectInfos,
      request,
      workspacePath
    )

    // Start the process
    this.executeScript(execution)

    return { executionId, channelName }
  }


  /**
   * Execute the Python script
   */
  private static async executeScript(execution: ScriptExecution) {
    const { id } = execution
    const channelName = 'test'

    try {
      // Update status to running
      execution.status = 'running'
      execution.startedAt = new Date()
      console.debug('channelName', channelName)

      // await new Promise(resolve => setTimeout(resolve, 10000));

      for (let i = 1; i <= 100; i++) {
        transmit.broadcast(channelName, {
          i: i
        })// Simulate some delay
      }


      // Broadcast start event
      transmit.broadcast(channelName, {
        type: 'started',
        executionId: id,
        timestamp: new Date().toISOString()
      })

      // Spawn Python process
      const args = this.extractArgsFromScriptExecution(execution)
      const scriptPath = execution.projectInfos.path + execution.projectInfos.scriptName
      const pythonPath = execution.projectInfos.path + '.venv/Scripts/python'

      if (!existsSync(pythonPath)){
        console.error('Python executable not found at:', pythonPath);
        transmit.broadcast(channelName, {
          type: 'error',
          executionId: id,
          data: 'No python found in ' + pythonPath,
          timestamp: new Date().toISOString()
        })
        // throw new Error('No python found in ' + pythonPath)
      }

      const pythonProcess = spawn(pythonPath, [scriptPath, ...args], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: execution.workspacePath,
      })

      // Store process reference
      this.runningProcesses.set(id, pythonProcess)

      // Handle stdout
      pythonProcess.stdout.on('data', (data) => {
        console.debug('stdout', data)
        const output = data.toString()
        transmit.broadcast(channelName, {
          type: 'output',
          executionId: id,
          stream: 'stdout',
          data: output,
          timestamp: new Date().toISOString()
        })
      })

      // Handle stderr
      pythonProcess.stderr.on('data', (data) => {
        console.debug('stderr', data)
        const output = data.toString()
        transmit.broadcast(channelName, {
          type: 'output',
          executionId: id,
          stream: 'stderr',
          data: output,
          timestamp: new Date().toISOString()
        })
      })

      // Handle process completion
      pythonProcess.on('close', async (code) => {
        execution.status = code === 0 ? 'completed' : 'failed'
        execution.completedAt = new Date()
        if (code) {
          execution.exitCode = code
        }

        console.debug('Close process with code:', code)
        transmit.broadcast(channelName, {
          type: 'completed',
          executionId: id,
          exitCode: code,
          status: execution.status,
          timestamp: new Date().toISOString()
        })

        // Cleanup
        this.runningProcesses.delete(id)
      })

      // Handle process errors
      pythonProcess.on('error', async (error) => {
        execution.status = 'failed'
        execution.completedAt = new Date()

        transmit.broadcast(channelName, {
          type: 'error',
          executionId: id,
          message: error.message,
          timestamp: new Date().toISOString()
        })

        // Cleanup
        this.runningProcesses.delete(id)
      })

      // Set timeout (optional)
      setTimeout(() => {
        if (this.runningProcesses.has(id)) {
          this.stopExecution(id)
        }
      }, 300000) // 5 minutes timeout

    } catch (error) {
      execution.status = 'failed'
      execution.completedAt = new Date()

      transmit.broadcast(channelName, {
        type: 'error',
        executionId: id,
        message: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * Stop a running execution
   */
  static async stopExecution(executionId: string): Promise<boolean> {
    const process = this.runningProcesses.get(executionId)
    const execution = this.executions.get(executionId)

    if (process && execution) {
      process.kill('SIGTERM')

      execution.status = 'stopped'
      execution.completedAt = new Date()

      transmit.broadcast(execution.channelName, {
        type: 'stopped',
        executionId,
        timestamp: new Date().toISOString()
      })

      this.runningProcesses.delete(executionId)
      return true
    }

    return false
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
            await file.move(app.tmpPath(workspacePath))
          }
        } else {
          const file = request.file(input.name)
          if (!file.isValid) {
            throw new Error(`File ${input.name} is not valid.`);
          }
          await file.move(app.tmpPath(workspacePath));
        }

      }
    }
  }

  private static extractArgsFromScriptExecution(executionData: ScriptExecution): string[]  {
    return executionData.projectInfos.inputs.map((input) => {return input.name})
  }


}
