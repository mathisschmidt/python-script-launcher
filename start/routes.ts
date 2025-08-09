/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import DashboardController from '#controllers/dashboard_controller'

router.get('/', [DashboardController, 'index'])
