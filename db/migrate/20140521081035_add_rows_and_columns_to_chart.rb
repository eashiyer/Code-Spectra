class AddRowsAndColumnsToChart < ActiveRecord::Migration
  def change
    add_column :charts, :rows, :integer, :default => 1
    add_column :charts, :columns, :integer, :default => 1
  end
end
