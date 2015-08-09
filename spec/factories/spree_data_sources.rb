# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :spree_data_source do
    sequence :store_name do |n|
    	"StoreName#{n}"
	end
  end
end
