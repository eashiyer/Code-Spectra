class QueryDataSourceSerializer < ActiveModel::Serializer
  embed :ids
  attributes  :id, :query, :frequency, 
			  :last_run_at, :enabled, :data_source_id,
			  :data_connection_id, :import_type, :bookmark_key, 
			  :bookmark_comparison_operator, :last_run_successful, 
			  :last_run_status, :created_at, :unsuccessfull_count
end
