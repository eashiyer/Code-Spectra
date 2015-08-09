class AddAccountIdToDataSources < ActiveRecord::Migration
  def change
	add_column :data_sources, :account_id, :integer, :default => 1
  end
end
