# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :user_filter do
  	field_name "field name"
  	display_name "display name"
  	format_as "sum"
  	comparison_operator "in"
  	field_values "[]"
  	disabled false
  	hide false
  end
end
