class DataSourceSerializer < ActiveModel::Serializer
  embed :ids
  attributes :id, :dimensions_str, :groups_str, :content, :fields_str, :name, :data_source_type, :load_count, :enabled,
  			 :data_types_updated, :unique_str, :index_str, :file_upload_state, :sheets_array, :ignored_str,
  			 :preview_data, :preview_headers, :updated_at, :account_template_id
  has_many :charts
  has_many :charts_data_sources
  has_many :rules 
  has_many :user_filters

  has_one  :account 
  has_one  :query_data_source 
  has_one  :spree_data_source 

end
