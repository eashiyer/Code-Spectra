class AddFactDisplayToChartsDataSource < ActiveRecord::Migration
	def change
  	  	add_column :charts_data_sources, :fact_display,  :string
	end
end
