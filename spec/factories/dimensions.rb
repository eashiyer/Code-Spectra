# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :dimension do
    field_name "MyString"
    format_as "MyString"
    display_name "MyString"
    rank 1
    sort_order "MyString"
    chart_id 1
  end
end
