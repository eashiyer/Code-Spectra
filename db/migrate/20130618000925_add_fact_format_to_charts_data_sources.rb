class AddFactFormatToChartsDataSources < ActiveRecord::Migration
  def change
  	add_column :charts_data_sources, :fact_format,  :string, :default => 'sum'
  end
end
