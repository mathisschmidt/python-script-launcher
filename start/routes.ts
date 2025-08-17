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
router.post('/execution', [ExecutionController, 'runExecution'])
router.get('/execution/:id', [ExecutionController, 'show'])
router.get('/execution/status/:id', [ExecutionController, 'getStatus'])
router.get('/execution/:id/:outputName', [ExecutionController, 'downloadOutputFile'])

import ExecutionMessageController from "#controllers/execution_message_controller"
router.get('/execution_message/:id', [ExecutionMessageController, 'show'])

import ConfigurationsController from "#controllers/configurations_controller";
router.get('/configuration', [ConfigurationsController, 'index'])
router.post('/configuration/loadConf', [ConfigurationsController, 'loadConf'])
