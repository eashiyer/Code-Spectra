class AddBookmarkKeyToQueryDataSources < ActiveRecord::Migration
  def change
    add_column :query_data_sources, :bookmark_key, :string
  end
end
