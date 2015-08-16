class CreateUserFilters < ActiveRecord::Migration
  def change
    create_table :user_filters do |t|
      t.timestamps
      t.string :field_name
      t.string :display_name
      t.string :format_as
      t.integer :comparison_operator
      t.text :field_values, :limit => 2.kilobytes
      t.boolean :disabled, :default => false
      t.boolean :hide, :default => false

      t.integer :user_id
      t.integer :data_source_id

    end
  end
end
