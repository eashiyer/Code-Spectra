class CreatePermissions < ActiveRecord::Migration
  def change
    create_table :permissions do |t|

      t.timestamps
	  t.integer :user_id
      t.references :permissible, polymorphic: true
      t.string 	:role

    end
  end
end
