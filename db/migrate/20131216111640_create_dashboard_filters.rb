class CreateDashboardFilters < ActiveRecord::Migration
  def change
    create_table :dashboard_filters do |t|
      t.string :field_name
      t.string :field_data_type
      t.integer :comparison_operator
      t.string :field_values
      t.integer :dashboard_id

      t.timestamps
    end
  end
end
