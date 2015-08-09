class AddUnsuccessfullCountToQueryDataSources < ActiveRecord::Migration
  def change
  	add_column :query_data_sources, :unsuccessfull_count, :integer, :default => 0
  end
end
