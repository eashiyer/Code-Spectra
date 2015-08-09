class ChangeFieldvaluesInDashboardFilters < ActiveRecord::Migration
  def up
  	change_column :dashboard_filters , :field_values , :text , :limit => 2.kilobytes
  end

  def down
  	change_column :dashboard_filters , :field_values , :string
  end
end
