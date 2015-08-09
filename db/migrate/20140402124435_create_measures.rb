class CreateMeasures < ActiveRecord::Migration
  def change
    create_table :measures do |t|
      t.string :field_name
      t.string :format_as
      t.string :display_name
      t.string :sort_order
      t.integer :chart_id
      t.boolean :is_calculated
      t.string :prefix
      t.string :suffix
      t.string :unit

      t.timestamps
    end
  end
end
