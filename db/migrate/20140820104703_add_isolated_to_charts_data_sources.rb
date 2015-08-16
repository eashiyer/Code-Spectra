class AddIsolatedToChartsDataSources < ActiveRecord::Migration
  def change
    add_column :charts_data_sources, :isolated, :boolean, :default => false
  end
end
