class AddIsGlobalToChartFilters < ActiveRecord::Migration
  def change
    add_column :chart_filters, :is_global, :boolean, :default => true
    add_column :chart_filters, :user_id, :integer
  end
end
