FactoryGirl.define do
  factory :user do
    	sequence :email do |n|
      	"example#{n}@example.com"
  	  end
    password 'changeme'
    password_confirmation 'changeme'
    is_admin false   
    account_id 1 
    # required if the Devise Confirmable module is used
    confirmed_at Time.now
  end
end