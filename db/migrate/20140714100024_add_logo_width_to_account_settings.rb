class AddLogoWidthToAccountSettings < ActiveRecord::Migration
  def change
    add_column :account_settings, :logo_width, :integer
  end
end
