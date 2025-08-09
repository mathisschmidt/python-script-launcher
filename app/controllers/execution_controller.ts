import { HttpContext } from '@adonisjs/core/http'
import ProjectModel from '#models/project'
import { ProjectInfosSchema } from '../../inertia/types/schemas.js'
import { ZodError } from 'zod'

export default class ExecutionController {

  async show({params, inertia, response}: HttpContext) {
    try {
      const project = await ProjectModel.findOrFail(params.id)

      const data = project.toJSON()
      const validatedData = ProjectInfosSchema.parse(data)

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
}
