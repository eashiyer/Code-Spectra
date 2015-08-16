# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :auth_server do
  	  client_id SecureRandom.uuid
	  auth_server_url "http://localhost:3001"
  end
end
