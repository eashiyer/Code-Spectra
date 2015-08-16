class CreateQueryDataSources < ActiveRecord::Migration
  def change
    create_table :query_data_sources do |t|

      t.timestamps
      t.text     :query
      t.integer  :frequency
      t.integer  :data_connection_id
      t.integer  :data_source_id
      t.datetime :last_run_at
      t.boolean  :enabled, :default => true
    end
  end
end