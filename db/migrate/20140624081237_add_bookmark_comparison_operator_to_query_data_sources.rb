class AddBookmarkComparisonOperatorToQueryDataSources < ActiveRecord::Migration
  def change
    add_column :query_data_sources, :bookmark_comparison_operator, :string
  end
end
