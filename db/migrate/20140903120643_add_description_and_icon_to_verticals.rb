class AddDescriptionAndIconToVerticals < ActiveRecord::Migration
  def change
    add_column :verticals, :description, :text
    add_column :verticals, :icon_type, :string
  end
end
