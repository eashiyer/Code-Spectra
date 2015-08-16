class SpreeDataSourceSerializer < ActiveModel::Serializer
  embed :ids
  attributes  :store_name, :store_url, :api_token, :frequency_of_import, :data_source_id, :import_type, :enabled,
  			  :last_run_at, :created_at
end
