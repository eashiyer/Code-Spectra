# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :account do
    sequence :name do |n|
    	"AccountName#{n}"
	end
	account_type "parent"
	data_sources_limit 5
	verticals_limit 10
	admin_users_limit 10
	basic_users_limit 10
  end
end
