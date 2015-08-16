class AddIsHiddenToVerticals < ActiveRecord::Migration
  def change
    add_column :verticals, :is_hidden, :boolean, :default => false
  end
end
