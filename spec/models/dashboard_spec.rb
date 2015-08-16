# == Schema Information
#
# Table name: dashboards
#
#  id           :integer          not null, primary key
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  title        :string(255)
#  subtitle     :string(255)
#  display_rank :integer
#  display_name :string(255)
#  vertical_id  :integer
#

require 'spec_helper'

describe Dashboard do

  it { should belong_to(:vertical) }
  it { should have_many(:charts) }
  it { should have_many(:permissions) }  

  before do
  	@account = FactoryGirl.create(:account)
  	@vertical = FactoryGirl.create(:vertical, :account => @account)
  	@dashboard = FactoryGirl.create(:dashboard, :vertical => @vertical)
  end

  it "should have method account" do
  	expect(@dashboard.account).to eq(@account)
  end

  it "should return dashboard users" do
      user = FactoryGirl.create(:user, :account => @account)
      User.stub(:current_user).and_return(user) 
      permission = FactoryGirl.create(:permission, :user => user, :permissible_type => 'Vertical', :permissible_id => @vertical.id)
      expect(@dashboard.users).to eq([user])      
  end

  it "should return active dashboard filters" do
      user = FactoryGirl.create(:user, :account => @account)
      User.stub(:current_user).and_return(user) 
      dashboard_filter = FactoryGirl.create(:dashboard_filter, :dashboard => @dashboard, :is_global => true)  
      expect(@dashboard.active_dashboard_filters).to eq([dashboard_filter])      
  end
end
