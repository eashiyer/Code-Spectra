class CreateChartsDataSources < ActiveRecord::Migration
  def up
  	create_table :charts_data_sources do |t|
  		t.timestamps
  		t.integer :chart_id
  		t.integer :data_source_id
      t.integer :count
      t.string  :dimension_name
      t.string  :dimension_format_as
      t.string  :depth
      t.string  :fact
      t.string  :fact_type
  	end
  end

  def down
  	drop_table :charts_data_sources
  end
end
