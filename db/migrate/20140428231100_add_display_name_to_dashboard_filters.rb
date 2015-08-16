class AddDisplayNameToDashboardFilters < ActiveRecord::Migration
  def change
  	add_column :dashboard_filters, :display_name, :string
  end
end
