class ChartFilterSerializer < ActiveModel::Serializer
	embed :ids
	attributes 	:id, :field_name, :format_as, :comparison_operator, :field_values, :exclude, :chart_id, :disabled, 
				:field_data_type, :date_range, :upper_range, :lower_range, :reference_direction,
			 	:reference_count, :reference_unit, :reference_date_today, :reference_date, :display_name,
			 	:is_global, :user_id

	has_one :chart
end