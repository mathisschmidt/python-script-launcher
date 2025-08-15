import { z } from 'zod'

export const InputInfosSchema = z.object({
  name: z.string(),
  description: z.string(),
  required: z.boolean()
})

export const FileInputInfosSchema = InputInfosSchema.extend({
  type: z.literal('file'),
  multiple: z.boolean()
})

export const TextInputInfosSchema = InputInfosSchema.extend({
  type: z.literal('text'),
  defaultValue: z.string().optional()
})

export const ProjectInfosSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  inputs: z.array(z.discriminatedUnion('type', [
    FileInputInfosSchema,
    TextInputInfosSchema
  ])),
  path: z.string(),
  scriptName: z.string(),
  outputs: z.array(z.string())
})

export type ProjectInfos = z.infer<typeof ProjectInfosSchema>
export type InputInfos = z.infer<typeof InputInfosSchema>
export type FileInputInfos = z.infer<typeof FileInputInfosSchema>
export type TextInputInfos = z.infer<typeof TextInputInfosSchema>


//##########################################################################################

export const runExecutionAnswerSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  executionId: z.string().optional(),
})

export const ExecutionStatusSchema = z.object({
  status: z.enum(['pending', 'running', 'completed', 'failed', 'stopped']),
  exitCode: z.number().nullable(),
  startedAt: z.coerce.date().nullable(),
  completedAt: z.coerce.date().nullable()
})

export type ExecutionStatus = z.infer<typeof ExecutionStatusSchema>
export type RunExecutionAnswer = z.infer<typeof runExecutionAnswerSchema>



//##########################################################################################
export const ExecutionMessageSchema = z.object({
  id: z.number(),
  executionId: z.string(),
  content: z.string(),
  timestamp: z.coerce.date()
})

export type ExecutionMessage = z.infer<typeof ExecutionMessageSchema>
