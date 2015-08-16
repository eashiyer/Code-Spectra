class CreateAuthServers < ActiveRecord::Migration
  def change
    create_table :auth_servers do |t|

      t.timestamps
      t.string :client_id
      t.string :auth_server_url      
      t.integer :account_id
    end
  end
end
