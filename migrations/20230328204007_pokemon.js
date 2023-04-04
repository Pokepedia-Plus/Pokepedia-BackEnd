/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('pokemon', function(table) {
    table.increments('id').primary();
    table.integer('pokemon_id').unique();
    table.string('name')
    table.string('abilities')
    table.string('types');
    table.string('appearances');
    table.float('height');
    table.string('moves',5000);
    table.string('front_sprite');
    table.string('back_sprite');
    table.string('dreamworld_sprite');
    table.string('stats',2000);
    table.float('weight');
    table.timestamps(true, true);
  });
};
'types,height,height,pokemon_id,moves,front_sprite,back_sprite,dreamworld_sprite,stats,weight'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('pokemon');
  };
