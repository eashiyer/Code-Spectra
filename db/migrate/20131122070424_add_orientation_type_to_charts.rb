class AddOrientationTypeToCharts < ActiveRecord::Migration
  def change
    add_column :charts, :orientation_type, :integer, :default => 1
  end
end
