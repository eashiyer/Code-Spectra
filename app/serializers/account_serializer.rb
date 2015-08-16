class AccountSerializer < ActiveModel::Serializer
	embed :ids
	attributes :id, :name, :account_type, :admin_users_limit, :basic_users_limit, :data_sources_limit, 
  :verticals_limit, :time_limit
 
  	has_one  :account_setting
  	has_many :account_templates
end