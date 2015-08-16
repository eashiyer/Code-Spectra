class AddIsCalculatedToChartsDataSources < ActiveRecord::Migration
  def change
    add_column :charts_data_sources, :is_calculated, :boolean, :default => false
  end
end
