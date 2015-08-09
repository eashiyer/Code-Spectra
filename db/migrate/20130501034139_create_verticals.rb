class CreateVerticals < ActiveRecord::Migration
  def change
    create_table :verticals do |t|

      t.timestamps
      t.string :name
    end
  end
end
