import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'execution_messages'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.text('content').notNullable()
      table.string('execution_id').notNullable().references('executions.id').onDelete('CASCADE')
      table.datetime('timestamp').notNullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())

      // Index for better query performance
      table.index('execution_id')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
