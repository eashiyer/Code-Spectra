class CreateDataConnections < ActiveRecord::Migration
  def change
    create_table :data_connections do |t|

      t.timestamps
      t.string  :display_name
      t.string 	:host, :null => false
      t.string 	:dbname
      t.string 	:username
      t.string 	:password
      t.string 	:port
      t.string  :socket
      t.boolean :use_ssl
      t.integer :query_duration
      t.string  :connection_type
    end
  end
end
