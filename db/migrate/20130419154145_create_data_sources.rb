class CreateDataSources < ActiveRecord::Migration
  def up
    create_table :data_sources do |t|
      t.timestamps
      t.string :name
      t.text :dimensions_str, :limit => 4.kilobytes
      t.text :groups_str, :limit => 4.kilobytes
      t.text :fields_str, :limit => 4.kilobytes
    end
    add_index :data_sources, :name
  end

  def down
  	drop_table :data_sources
  end

end
