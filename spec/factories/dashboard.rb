# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :dashboard do
    sequence :title do |n|
    	"DashboardTitle#{n}"
	end
    sequence :subtitle do |n|
    	"DashboardSubTitle#{n}"
	end
	  	
    sequence :display_name do |n|
    	"DashboardDispName#{n}"
	end
  end
end
