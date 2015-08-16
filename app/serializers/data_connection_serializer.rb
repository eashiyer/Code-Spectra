class DataConnectionSerializer < ActiveModel::Serializer
  embed :ids
  attributes    :id, :display_name, :host, :dbname, 
				:username, :password, :port, 
				:socket, :use_ssl, :query_duration, 
				:connection_type, :service_name, :data_server_name

  has_many :query_data_sources
  has_one  :account

end
