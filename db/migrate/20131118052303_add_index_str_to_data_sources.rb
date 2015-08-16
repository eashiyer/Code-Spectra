class AddIndexStrToDataSources < ActiveRecord::Migration
  def change
  	add_column :data_sources, :index_str, :string
  end
end
