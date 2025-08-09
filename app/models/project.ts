// app/Models/ProjectInfo.ts
import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import {FileInputInfos, TextInputInfos} from "../../inertia/types/projectInfos.js";

export default class ProjectInfo extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare description: string

  @column()
  declare path: string

  @column()
  declare scriptName: string

  @column({
    serialize: (value) => JSON.parse(value),
    prepare: (value) => JSON.stringify(value),
  })
  declare inputs: Array<FileInputInfos | TextInputInfos>

  // Store outputs as JSON array
  @column({
    serialize: (value) => JSON.parse(value),
    prepare: (value) => JSON.stringify(value),
  })
  declare outputs: string[]

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
