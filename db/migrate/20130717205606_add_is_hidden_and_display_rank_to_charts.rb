class AddIsHiddenAndDisplayRankToCharts < ActiveRecord::Migration
  def change
    add_column :charts, :is_hidden, :boolean, :default => false
    add_column :charts, :display_rank, :integer, :default => 0
  end
end
