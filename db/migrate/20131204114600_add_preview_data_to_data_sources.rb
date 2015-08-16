class AddPreviewDataToDataSources < ActiveRecord::Migration
  def change
    add_column :data_sources, :preview_data, :text
  end
end
