class AddIsolatedToCharts < ActiveRecord::Migration
  def change
    add_column :charts, :isolated, :boolean, :default => false
  end
end
