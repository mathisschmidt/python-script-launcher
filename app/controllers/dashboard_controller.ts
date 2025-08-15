import { HttpContext } from '@adonisjs/core/http'
import Project from '#models/project'
import {ProjectInfosSchema} from '../../inertia/types/schemas.js'
import {ZodError} from "zod";
import logger from "@adonisjs/core/services/logger";

export default class DashboardController {
  async index({ inertia }: HttpContext) {
    try {
      const projects = await Project.all()
      const validatedProjects = projects.map(project => {
          const data = project.toJSON()
          return ProjectInfosSchema.parse(data)
        }
      )
      logger.info(`[DashboardController] Fetched ${validatedProjects.length} projects`)
      return inertia.render('dashboard', {
        projects: validatedProjects
      })
    } catch (error) {
      if (error instanceof ZodError) {
        logger.error(error.message)
        return inertia.render('dashboard', {
          projects: [],
          error: 'An error occurred while fetching projects. Please try again later.'
        })
      }
      console.error('Unexpected error:', error)
      throw error
    }
  }
}
