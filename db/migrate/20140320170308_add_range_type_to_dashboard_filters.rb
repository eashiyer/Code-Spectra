class AddRangeTypeToDashboardFilters < ActiveRecord::Migration
  def change
  	add_column :dashboard_filters, :date_range, :boolean
  	add_column :dashboard_filters, :upper_range, :date
  	add_column :dashboard_filters, :lower_range, :date
  	add_column :dashboard_filters, :reference_direction, :string
  	add_column :dashboard_filters, :reference_count, :integer
	  add_column :dashboard_filters, :reference_unit, :string
  	add_column :dashboard_filters, :reference_date_today, :boolean
  	add_column :dashboard_filters, :reference_date, :date
  end
end
