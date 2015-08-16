class CreateComments < ActiveRecord::Migration
  def up
    create_table :comments do |t|
      t.timestamps
      t.text :message
      t.string :author_name 
      t.integer :author_id
      t.integer :status, :default => 0
      t.integer :chart_id
    end

    add_index :comments, :status
    add_index :comments, :author_id
  end

  def down
  	drop_table :comments
  end
end
