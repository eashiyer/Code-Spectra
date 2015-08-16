class AddPredefinedRangeToDashboardFilters < ActiveRecord::Migration
  def change
    add_column :dashboard_filters, :predefined_range, :string
  end
end
