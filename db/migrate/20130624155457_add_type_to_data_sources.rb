class AddTypeToDataSources < ActiveRecord::Migration
  def change
  	add_column :data_sources, :data_source_type,  :string, :default => 'csv'
  end
end
