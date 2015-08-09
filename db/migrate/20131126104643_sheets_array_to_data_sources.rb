class SheetsArrayToDataSources < ActiveRecord::Migration
  def change
    add_column :data_sources, :sheets_array, :string
  end
end
