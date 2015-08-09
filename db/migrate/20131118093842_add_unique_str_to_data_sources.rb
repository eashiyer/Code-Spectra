class AddUniqueStrToDataSources < ActiveRecord::Migration
  def change
  	add_column :data_sources, :unique_str, :string
  end
end
