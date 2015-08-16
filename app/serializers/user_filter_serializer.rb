class UserFilterSerializer < ActiveModel::Serializer
  embed :ids
  attributes :id, :field_name, :display_name, :format_as, :comparison_operator, :field_values, 
      :disabled, :hide, :user_id, :data_source_id
  
  has_one :user
  has_one :data_source
end
