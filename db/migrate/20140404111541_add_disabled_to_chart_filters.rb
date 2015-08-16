class AddDisabledToChartFilters < ActiveRecord::Migration
  def change
    add_column :chart_filters, :disabled, :boolean, :default => false
  end
end
