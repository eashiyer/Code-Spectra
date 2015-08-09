class AddfactunitToChartsDataSource < ActiveRecord::Migration
  def change
  	add_column :charts_data_sources, :fact_unit,  :string, :default => 'Rs'
  end
end
