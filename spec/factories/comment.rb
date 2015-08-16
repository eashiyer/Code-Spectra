# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :comment do
  	chart
  	sequence :author_id do |n|
    	"#{n}"
	end
  	sequence :author_name do |n|
    	"Author#{n}"
	end
	message "Why is this chart red?"
  end
end
