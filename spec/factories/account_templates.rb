# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :account_template, :class => 'AccountTemplate' do
    account_id 1
    template_name "Spree Commerce"
    template_inputs ""
    status 1
  end
end
