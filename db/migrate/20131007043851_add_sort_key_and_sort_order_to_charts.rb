class AddSortKeyAndSortOrderToCharts < ActiveRecord::Migration
  def change
  	add_column :charts, :sort_by_key, :string
  	add_column :charts, :desc_order, :boolean, :default => false
  end
end
