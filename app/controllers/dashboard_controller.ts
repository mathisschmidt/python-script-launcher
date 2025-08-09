import { HttpContext } from '@adonisjs/core/http'
import Project from '#models/project'
import {ProjectInfosSchema} from '../../inertia/types/schemas.js'
import {ZodError} from "zod";

export default class DashboardController {
  async index({ inertia }: HttpContext) {
    try {
      const projects = await Project.all()
      const validatedProjects = projects.map(project => {
          const data = project.toJSON()
          return ProjectInfosSchema.parse(data)
        }
      )

      console.log(validatedProjects)
      return inertia.render('dashboard', {
        projects: validatedProjects
      })
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('Validation error:', error)
        return inertia.render('dashboard', {
          projects: [],
          error: 'Une erreur est survenue lors du chargement des projets'
        })
      }
      console.error('Unexpected error:', error)
      throw error
    }
  }
}
