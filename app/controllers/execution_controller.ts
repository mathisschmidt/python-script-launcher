import { HttpContext } from '@adonisjs/core/http'
import ProjectModel from '#models/project'
import { ProjectInfosSchema } from '../../inertia/types/schemas.js'
import { ZodError } from 'zod'
import ProjectInfo from "#models/project";
import ExecuteProject from "../execution_scripts/execute.js";

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

      const resultExecution = await (new ExecuteProject(projectInfos, request)).execute()
      console.log(resultExecution)
    } catch (error) {
      if (error instanceof ZodError) {
        return response.status(422).json({ error: 'Validation error: ' + error.message })
      }
      return response.status(404).json({ error: 'Internal error:' + error.message })
    }

  }
}
