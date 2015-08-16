class AddQueryStrToChartsDataSources < ActiveRecord::Migration
  def change
    add_column :charts_data_sources, :query_str, :string
    add_column :charts_data_sources, :row_query_mode, :boolean
  end
end
