import { DateTime } from 'luxon'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import {BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import ExecutionMessage from "#models/execution_message";

export default class Execution extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare workspacePath: string

  @column()
  declare scriptPath: string

  @column()
  declare pythonPath: string

  @column({
    prepare: (value: string[]) => JSON.stringify(value),
    consume: (value: string) => JSON.parse(value)
  })
  declare args: string[]

  @column()
  declare status: 'pending' | 'running' | 'completed' | 'failed' | 'stopped'

  @column()
  declare exitCode?: number

  @column()
  declare startedAt?: DateTime

  @column()
  declare completedAt?: DateTime

  @hasMany(() => ExecutionMessage)
  declare messages: HasMany<typeof ExecutionMessage>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
