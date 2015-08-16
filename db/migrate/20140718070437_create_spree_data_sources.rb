class CreateSpreeDataSources < ActiveRecord::Migration
  def change
    create_table :spree_data_sources do |t|
      t.string :store_name	
      t.string :store_url 
      t.string :api_token
      t.integer :frequency_of_import, :default => 5
      t.integer :data_source_id
      t.datetime :last_run_at
      t.boolean :last_run_successful
      t.string :last_run_status
      t.string :import_type
      t.timestamps
    end
  end
end
