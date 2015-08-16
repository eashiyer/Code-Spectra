class AddDataServerNameToDataConnections < ActiveRecord::Migration
  def change
    add_column :data_connections, :data_server_name, :string
  end
end
