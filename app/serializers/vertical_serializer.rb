class VerticalSerializer < ActiveModel::Serializer
  embed :ids

  attributes :id, :name, :account_template_id, :description, :icon_type, :custom_icon, :custom_icon_url
  has_many :dashboards
  has_many :permissions, :as => :permissible
  has_one  :account
end
