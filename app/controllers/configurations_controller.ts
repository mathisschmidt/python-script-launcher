import type { HttpContext } from '@adonisjs/core/http'
import logger from "@adonisjs/core/services/logger";
import YAML from 'yaml'
import {ProjectInfosSchemaWithoutId, ProjectInfosYamlSchema} from "../../inertia/types/schemas.js";
import Execution from "#models/execution";
import ProjectInfo from "#models/project";
import ExecutionMessage from "#models/execution_message";

export default class ConfigurationsController {

  async index({inertia}: HttpContext) {
    try {
      const projects = await ProjectInfo.all()
      const parsedProjects = projects.map((project) => {
        const data = project.toJSON()
        return ProjectInfosSchemaWithoutId.parse(data)
      })
      const yamlData = ProjectInfosYamlSchema.parse({
        projects: parsedProjects,
      })


      return inertia.render('configuration', {currentYamlConfig: YAML.stringify(yamlData)})
    } catch (error) {
      logger.error('Unexpected error:' + error )
      throw error
    }

  }

  async loadConf({ request, response }: HttpContext) {
    try {
      // Get YAML content from request body
      const yamlContent = request.input('yaml')
      if (!yamlContent) {
        return response.badRequest({
          errors: [{ message: 'yaml field is required in body' }]
        })
      }

      // Parse YAML → JS object
      let parsed: unknown
      try {
        parsed = YAML.parse(yamlContent)
      } catch (err) {
        return response.badRequest({
          errors: [{ message: 'Invalid YAML format', detail: err.message }]
        })
      }

      // Validate with Zod
      const result = ProjectInfosYamlSchema.safeParse(parsed)

      if (!result.success) {
        return response.badRequest({
          errors: result.error.issues.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        })
      }

      //Delete all previous data
      await ProjectInfo.query().delete()
      await Execution.query().delete()
      await ExecutionMessage.query().delete()

      //Recreate the project infos data
      for (const project of result.data.projects) {
        await ProjectInfo.create(project)
      }

      // ✅ Success
      return response.ok({
        message: 'Configuration loaded successfully',
        data: result.data,
      })
    } catch (err) {
      return response.internalServerError({
        message: 'Unexpected error',
        detail: err.message,
      })
    }
  }

}
