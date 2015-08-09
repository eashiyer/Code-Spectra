class AddExcludedRowsToCharts < ActiveRecord::Migration
  def change
    add_column :charts, :excluded_rows, :string
  end
end
