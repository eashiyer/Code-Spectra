class AddAutomaticRefreshToDashboards < ActiveRecord::Migration
  def change
    add_column :dashboards, :auto_refresh, :boolean, :default => false
    add_column :dashboards, :refresh_interval, :integer
  end
end
