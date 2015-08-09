class AddImportTypeToQueryDataSources < ActiveRecord::Migration
  def change
    add_column :query_data_sources, :import_type, :integer
  end
end
