# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
	factory :data_source do
	    sequence :name do |n|
	    	"DataSource#{n}"
		end

	  	fields_str	[{:name => "test field name", :display_name => "display name", :datatype => "varchar",:options => {:string_length=>200}.to_json}].to_json
	  	account_id 1
	end
end
