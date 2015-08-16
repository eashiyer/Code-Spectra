class AccountTemplateSerializer < ActiveModel::Serializer
	embed :ids

	attributes :account_id, :id, :status, :template_inputs, :template_name

	has_one :account 
end