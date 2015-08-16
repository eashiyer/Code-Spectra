class AddFormatAsToChartFilters < ActiveRecord::Migration
  def change
	   add_column :chart_filters, :format_as, :string	
  end
end
