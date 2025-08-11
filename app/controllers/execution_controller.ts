import { HttpContext } from '@adonisjs/core/http'
import ProjectModel from '#models/project'
import {ProjectInfosSchema, RunExecutionAnswer} from '../../inertia/types/schemas.js'
import { ZodError } from 'zod'
import ProjectInfo from "#models/project";
import ExecuteScriptService from "#services/execute_script_service";

// TODO: implement the stop execution

export default class ExecutionController {

  getAndValidateProjectInfos(project: ProjectInfo) {
    const data = project.toJSON()
    try {
      return ProjectInfosSchema.parse(data)
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error('Validation error: ' + error.message)
      }
      throw error
    }
  }


  async show({params, inertia, response}: HttpContext) {
    try {
      const project = await ProjectModel.findOrFail(params.id)
      const validatedData = this.getAndValidateProjectInfos(project)

      return inertia.render('execution', {
        projectInfos: validatedData
      })
    } catch (error) {
      if (error instanceof ZodError) {
        return response.status(422).redirect().back()
      }
      return response.status(404).redirect().back()
    }
  }

  async runExecution({request, response}: HttpContext) {
    const data = request.body()
    if (!data.project_id) {
      return response.status(400).json({ error: 'Project ID is required' })
    }

    try {
      // Get data and validate it
      const project = await ProjectModel.findOrFail(data.project_id)
      const projectInfos = this.getAndValidateProjectInfos(project)

      const { executionId, channelName } = await ExecuteScriptService.startExecution(
        projectInfos,
        request
      )

      return response.json({
        success: true,
        executionId,
        channelName,
        message: 'Script execution started'
      } as RunExecutionAnswer)
    } catch (error) {
      if (error instanceof ZodError) {
        return response.status(422).json({
          success: false,
          message: 'Validation error: ' + error.message
        } as RunExecutionAnswer)
      }
      return response.status(400).json({
        success: false,
        message: error.message
      } as RunExecutionAnswer)
    }

  }
}
