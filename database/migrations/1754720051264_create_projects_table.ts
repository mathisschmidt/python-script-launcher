import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'project_infos'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('name').notNullable()
      table.text('description').notNullable()
      table.string('path').notNullable()
      table.string('script_name').notNullable()

      // Store inputs as JSON with flattened attributes
      table.json('inputs').notNullable().defaultTo('[]')

      // Store outputs as JSON array
      table.json('outputs').notNullable().defaultTo('[]')

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
