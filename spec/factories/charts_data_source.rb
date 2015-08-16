FactoryGirl.define do
  factory :charts_data_source do
  	sequence :chart_id do |n|
    	"#{n}"
	end
	sequence :data_source_id do |n|
    	"#{n}"
	end
  end
end
