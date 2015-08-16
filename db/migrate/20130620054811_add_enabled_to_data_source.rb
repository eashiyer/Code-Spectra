class AddEnabledToDataSource < ActiveRecord::Migration
  def change
    add_column :data_sources, :enabled, :boolean
  end
end
