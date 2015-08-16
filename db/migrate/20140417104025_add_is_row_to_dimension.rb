class AddIsRowToDimension < ActiveRecord::Migration
  def change
    add_column :dimensions, :is_row, :boolean, :default => false
  end
end
