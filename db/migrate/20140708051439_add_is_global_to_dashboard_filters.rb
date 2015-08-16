class AddIsGlobalToDashboardFilters < ActiveRecord::Migration
  def change
  	add_column :dashboard_filters, :is_global, :boolean, :default => true
  	add_column :dashboard_filters, :user_id, :integer
  end
end
