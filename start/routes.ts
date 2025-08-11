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

import ExecutionController from "#controllers/execution_controller";
router.get('/execution/:id', [ExecutionController, 'show'])
router.post('/execution', [ExecutionController, 'runExecution'])

import transmit from '@adonisjs/transmit/services/main'
transmit.registerRoutes()

