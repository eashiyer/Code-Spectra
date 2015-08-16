class AddAccountIdToDataConnection < ActiveRecord::Migration
  def change
    add_column :data_connections, :account_id, :integer
  end
end
