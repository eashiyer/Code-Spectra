class CreateChartFilters < ActiveRecord::Migration
  def change
    create_table :chart_filters do |t|

	    t.timestamps
      	t.string  :field_name
      	t.integer :comparison_operator
      	t.string  :field_values
      	t.boolean :exclude
      	t.integer :chart_id
    end
  end
end

