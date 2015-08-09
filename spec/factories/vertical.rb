FactoryGirl.define do
  factory :vertical do
    sequence :name do |n|
    	"VerticalName#{n}"
	end
  end
end
