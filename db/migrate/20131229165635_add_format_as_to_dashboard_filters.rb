class AddFormatAsToDashboardFilters < ActiveRecord::Migration
  def change
	   add_column :dashboard_filters, :format_as, :string	
  end
end
