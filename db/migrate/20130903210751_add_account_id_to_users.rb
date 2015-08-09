class AddAccountIdToUsers < ActiveRecord::Migration
  def change
  	add_column :users, :account_id, :integer, :default => 1
  end
end
