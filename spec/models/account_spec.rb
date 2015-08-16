require 'spec_helper'

describe Account do
	it { should have_many(:users) }
	it { should have_many(:data_sources) }
	it { should have_many(:verticals) }

	# it { should validate_uniqueness_of(:name) }	
	it { should validate_presence_of(:name) }	

	before(:each) do
  		@account = FactoryGirl.create(:account)
  		@user = FactoryGirl.create(:user, :is_admin => true, :account => @account)
  		User.stub(:current_user).and_return(@user) 
	end

	it "should return admin users" do
		user2 = FactoryGirl.create(:user, :is_admin => true, :account => @account)
		expect(@account.admins).to eq([@user,user2])
	end	

	describe ".create_account" do
		it "should return true if account is created" do
		    @attr = {
		      :id => 99,	
		      :email => "user@example.com",
		      :password => "firstnamelastname3",
		      :password_confirmation => "firstnamelastname3",
		      :account => FactoryGirl.create(:account)
		    }
			user = FactoryGirl.build(:user, @attr)
			User.stub(:new).and_return(user)
			params = {:data =>{:accountName => 'xxx', :email => 'test@test.com', :firstName => 'firstname', :lastName => 'lastname'}}
			expect(Account.create_account(params)).to be_true
		end		

		it "should return false if account is not created" do
			params = {:data =>{:accountName => 'xxx'}}
			expect(Account.create_account(params)).to be_false
		end		
	end
end
