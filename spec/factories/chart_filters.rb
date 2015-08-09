# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :chart_filter do
  	field_name "field name"
  	format_as "sum"
  	comparison_operator "in"
  	field_values "[]"
  	disabled false
  end
end
