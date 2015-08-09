class AddCollapseNavbarToAccountSettings < ActiveRecord::Migration
  def change
    add_column :account_settings, :collapse_navbar, :boolean, :default => false
  end
end
