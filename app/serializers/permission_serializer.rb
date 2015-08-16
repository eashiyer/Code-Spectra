class PermissionSerializer < ActiveModel::Serializer
  embed :ids
  attributes :id, :role, :permissible_type, :permissible_id
  has_one :user
end
