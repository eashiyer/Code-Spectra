class AddLastRunSuccessfulAndLastRunStatusToQueryDataSources < ActiveRecord::Migration
  def change
    add_column :query_data_sources, :last_run_successful, :boolean
    add_column :query_data_sources, :last_run_status, :string
  end
end
