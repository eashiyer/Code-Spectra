class UserSerializer < ActiveModel::Serializer
  embed :ids
  attributes :id, :first_name, :last_name, :email, :is_admin, :created_at, 
  			:user_permissions, :confirmation_token, :confirmation_sent_at, 
  			:confirmed_at, :company_logo_url, :logo_width, :has_api_access, 
  			:authentication_token, :api_access_token, :color_palette
  has_many :permissions
  has_many :user_filters  
  has_one :account
  has_one :user_color_preference
end
