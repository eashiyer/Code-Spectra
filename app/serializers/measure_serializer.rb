class MeasureSerializer < ActiveModel::Serializer
  embed :ids
  attributes :id, :chart_id, :display_name, :field_name, :format_as, :is_calculated, :prefix, 
  				:sort_order, :suffix, :unit, :account_template_id
end
