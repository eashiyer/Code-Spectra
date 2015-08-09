class ChartsDataSourceSerializer < ActiveModel::Serializer
  embed :ids
  attributes :id, :dimension_name, :depth, :dimension_format_as, :fact, :fact_type, :fact_display, 
  			 :fact_unit, :fact_format, :count, :chart_id, :data_source_id, :is_calculated, :account_template_id, :isolated
end
