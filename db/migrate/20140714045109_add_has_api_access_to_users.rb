class AddHasApiAccessToUsers < ActiveRecord::Migration
  def change
    add_column :users, :has_api_access, :boolean, :default => false
  end
end
