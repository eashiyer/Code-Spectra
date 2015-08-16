# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :measure do
    field_name "FieldName"
    format_as "Formatas"
    display_name "displayFieldName"
    sort_order "asc"
    chart_id 1
    is_calculated false
    prefix ""
    suffix ""
    unit ""
  end
end
