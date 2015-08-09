class AddColorsToAccountSettings < ActiveRecord::Migration
  def change
  	add_column :account_settings, :top_bar_color, :string, :default => '#FFFFFF'
  	add_column :account_settings, :workspace_color, :string, :default => '#323232'
  	add_column :account_settings, :dashboard_bar_color, :string, :default => '#323232'
  end
end
