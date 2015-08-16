class AddClientNameToAuthServers < ActiveRecord::Migration
  def change
  	add_column :auth_servers, :client_name, :string
  end
end
