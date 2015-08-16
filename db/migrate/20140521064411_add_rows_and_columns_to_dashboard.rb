class AddRowsAndColumnsToDashboard < ActiveRecord::Migration
  def change
    add_column :dashboards, :rows, :integer, :default => 2
    add_column :dashboards, :columns, :integer, :default => 2
  end
end
