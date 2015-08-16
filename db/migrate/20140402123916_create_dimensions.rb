class CreateDimensions < ActiveRecord::Migration
  def change
    create_table :dimensions do |t|
      t.string :field_name
      t.string :format_as
      t.string :display_name
      t.integer :rank
      t.string :sort_order
      t.integer :chart_id

      t.timestamps
    end
  end
end
