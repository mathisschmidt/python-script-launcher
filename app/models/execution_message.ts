import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import {BaseModel, belongsTo, column} from '@adonisjs/lucid/orm'
import Execution from "#models/execution";

export default class ExecutionMessage extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare content: string

  @belongsTo(() => Execution)
  declare executionId: BelongsTo<typeof Execution>

  @column()
  declare timestamp: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
