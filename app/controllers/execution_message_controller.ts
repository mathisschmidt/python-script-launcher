import {HttpContext} from "@adonisjs/core/http";
import Execution from "#models/execution";
import ExecuteScriptService from "#services/execute_script_service";
import {ExecutionMessageSchema} from "../../inertia/types/schemas.js";
import logger from "@adonisjs/core/services/logger";

export default class ExecutionMessageController {

  async show({params, request, response}: HttpContext) {
    try {
      logger.debug(`Fetching execution messages for execution ID: ${params.id}`);
      const startTime = request.input("startTime", null)

      if (startTime) {
        logger.debug(`startTime given: ${startTime}`);
      }

      const execution = await Execution.findOrFail(params.id)
      // TODO: Maybe can have error on the type of startTime
      const executionMessages = await ExecuteScriptService.getExecutionMessages(execution, startTime)

      const validatedMessages = executionMessages.map(message => {
        const data = message.toJSON();
         logger.debug('message json: ' + data)
        return ExecutionMessageSchema.parse(data)
      })

      logger.debug(`Execution Message Schema: ${JSON.stringify(validatedMessages)}`)
      return response.json(validatedMessages);
    } catch (error) {
      logger.error('Error fetching execution messages:', error.message);
      return response.status(404).json({
        error: error
      });
    }
  }
}
