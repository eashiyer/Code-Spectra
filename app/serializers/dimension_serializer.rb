class DimensionSerializer < ActiveModel::Serializer
  embed :ids
  attributes :id, :chart_id, :display_name, :field_name, :format_as, :rank, :sort_order, :is_row, :account_template_id
end
