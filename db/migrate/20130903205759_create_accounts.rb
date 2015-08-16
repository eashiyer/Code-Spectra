class CreateAccounts < ActiveRecord::Migration
  def change
    create_table :accounts do |t|

      t.timestamps
      t.string :name
      t.string :account_type

      t.integer :admin_users_limit
      t.integer :manager_users_limit
      t.integer :basic_users_limit
      t.integer :data_sources_limit
      t.integer :verticals_limit
      t.datetime :time_limit

    end
  end
end
