# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :data_connection do
  	display_name 'test'
  	host '127.0.0.1'
  	dbname 'test'
  	
  end
end
