class DashboardFilterSerializer < ActiveModel::Serializer
  attributes :id, :field_name, :comparison_operator, :field_values, :dashboard_id, :field_data_type,
  			 :format_as, :disabled, :date_range, :upper_range, :lower_range, :reference_direction,
			 :reference_count, :reference_unit, :reference_date_today, :reference_date, :display_name,
			 :is_global, :user_id, :predefined_range
end
