class AddFileUploadStateToDataSources < ActiveRecord::Migration
  def change
    add_column :data_sources, :file_upload_state, :integer
  end
end
