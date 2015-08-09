class AddServiceNameToDataConnection < ActiveRecord::Migration
  def change
    add_column :data_connections, :service_name, :string
  end
end
