class AddDataTypesUpdatedToDataSources < ActiveRecord::Migration
  def change
    add_column :data_sources, :data_types_updated, :boolean, :default => false
  end
end
