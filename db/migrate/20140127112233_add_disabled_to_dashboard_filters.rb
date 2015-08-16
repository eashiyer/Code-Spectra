class AddDisabledToDashboardFilters < ActiveRecord::Migration
  def change
    add_column :dashboard_filters, :disabled, :boolean, :default => false
  end
end
