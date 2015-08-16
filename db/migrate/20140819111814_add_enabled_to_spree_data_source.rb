class AddEnabledToSpreeDataSource < ActiveRecord::Migration
  def change
    add_column :spree_data_sources, :enabled, :boolean, :default => true
  end
end
