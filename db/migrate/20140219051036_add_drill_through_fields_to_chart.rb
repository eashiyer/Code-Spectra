class AddDrillThroughFieldsToChart < ActiveRecord::Migration
  def change
    add_column :charts, :drill_through_fields, :string
  end
end
