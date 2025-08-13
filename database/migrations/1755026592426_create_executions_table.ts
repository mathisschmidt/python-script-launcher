import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'executions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.string('workspace_path').notNullable()
      table.string('script_path').notNullable()
      table.string('python_path').notNullable()
      table.json('args').notNullable().defaultTo('[]')
      table.enum('status', ['pending', 'running', 'completed', 'failed', 'stopped']).notNullable().defaultTo('pending')
      table.integer('exit_code').nullable()
      table.datetime('started_at').nullable()
      table.datetime('completed_at').nullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
