# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :chart do
  	sequence :dashboard_id do |n|
    	"#{n}"
	end

  	chart_type 1
  end
end
