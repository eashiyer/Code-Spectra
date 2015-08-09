# == Schema Information
#
# Table name: verticals
#
#  id         :integer          not null, primary key
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  name       :string(255)
#  is_hidden  :boolean          default(FALSE)
#

require 'spec_helper'


describe Vertical do
	before(:each) do
		@dashboard = {:title => 'Sample Dashboard'}
		@account = FactoryGirl.create(:account)
	    @attr = {
	      :name => "Sample Vertical",
	      :account => @account
	    }	    
	    @vertical = FactoryGirl.create(:vertical, @attr)
	end

	it { should have_many(:dashboards) }
  	it { should have_many(:permissions) }
  	it { should belong_to(:account) }

  	it { should validate_presence_of(:name) }
  	it { should validate_uniqueness_of(:name).scoped_to(:account_id) }
  	it { should validate_presence_of(:account) }

	it "should check limit before creating vertcal" do
		expect(@vertical.check_limit).to eq(true)		
	end

	it "should return false if vertical limit is crosed" do
		account = FactoryGirl.create(:account, :name => "test account", :verticals_limit => 1)
		vertical1 = FactoryGirl.create(:vertical, :name => "test",:account => account)	
		account.update_attribute('verticals_limit', nil)
		expect(vertical1.check_limit).to eq(false)
	end

	it "should return only permissible dashboards is current user is not admin" do
		dashboard = FactoryGirl.create(:dashboard, :vertical => @vertical)
		user = FactoryGirl.create(:user, :account => @account)
		User.stub(:current_user).and_return(user)
		expect(@vertical.dashboards).to eq([])
	end	

	it "should return all dashboards is current user is admin" do
		dashboard = FactoryGirl.create(:dashboard, :vertical => @vertical)
		user = FactoryGirl.create(:user, :is_admin => true, :account => @account)
		User.stub(:current_user).and_return(user)		
		expect(@vertical.dashboards).to eq([dashboard])
	end	

end
