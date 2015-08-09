require 'spec_helper'

describe AccountTemplate do
	it { should belong_to(:account)}
	it { should have_many(:data_sources)}
	it { should have_many(:verticals)}
	it { should have_many(:dashboards)}
	it { should have_many(:charts)}
	it { should have_many(:charts_data_sources)}
	it { should have_many(:dimensions)}
	it { should have_many(:measures)}

	describe "#apply_template" do

		before(:each) do
		    @account = FactoryGirl.create(:account)
		    @user = FactoryGirl.create(:user, :account => @account)
      		User.stub(:current_user).and_return(@user)
		    template_inputs={:store_name => "test store", :store_url => "test url", :api_token => "testtoken", :sales => true}.to_json
		    @account_template = FactoryGirl.create(:account_template, :account => @account, :template_inputs => template_inputs)
	  	end

		it "should create data_sources" do
			count = DataSource.all.count
			@account_template.apply_template
 			expect(DataSource.all.count).to be > count
		end

		it "should create workspaces" do
			count = Vertical.all.count
			@account_template.apply_template
 			expect(Vertical.all.count).to be > count
		end
	end

	describe "#create_data_sources" do

		before(:each) do
		    @account = FactoryGirl.create(:account)
		    @user = FactoryGirl.create(:user, :account => @account)
      		User.stub(:current_user).and_return(@user)
		    template_inputs={:store_name => "test store", :store_url => "test url", :api_token => "testtoken", :sales => true}.to_json
		    @account_template = FactoryGirl.create(:account_template, :account => @account, :template_inputs => template_inputs)
	  	end

		it "should create data_sources" do
			count = DataSource.all.count
			@account_template.apply_template
 			expect(DataSource.all.count).to be > count
		end

		it "should raise exception if data_source is unable to save" do
			account = FactoryGirl.create(:account, :data_sources_limit => 0)
		    user = FactoryGirl.create(:user, :account => account)
      		User.stub(:current_user).and_return(user)
		    template_inputs={:store_name => "test store", :store_url => "test url", :api_token => "testtoken", :sales => true}.to_json
		    account_template = FactoryGirl.create(:account_template, :account => account, :template_inputs => template_inputs)
			expect(account_template.apply_template).to raise_error
		end

		it "should create spree_data_source entry" do
			count = SpreeDataSource.all.count
			@account_template.apply_template
 			expect(SpreeDataSource.all.count).to be > count
		end

		it "should raise exception if spree_data_source is unable to save" do
			@account_template.stub(:template_inputs).and_return('{}')
			expect(@account_template.apply_template).to raise_error
		end
	end

	describe "#create_workspaces" do

		before(:each) do
		    @account = FactoryGirl.create(:account)
		    @user = FactoryGirl.create(:user, :account => @account)
      		User.stub(:current_user).and_return(@user)
		    template_inputs={:store_name => "test store", :store_url => "test url", :api_token => "testtoken", :sales => true}.to_json
		    @account_template = FactoryGirl.create(:account_template, :account => @account, :template_inputs => template_inputs)
	  	end

		it "should create workspaces" do
			count = Vertical.all.count
			@account_template.apply_template
 			expect(Vertical.all.count).to be > count
		end

		it "should raise exception if workspace is unable to save" do
			account = FactoryGirl.create(:account, :verticals_limit => 0)
		    user = FactoryGirl.create(:user, :account => account)
      		User.stub(:current_user).and_return(user)
		    template_inputs={:store_name => "test store", :store_url => "test url", :api_token => "testtoken", :sales => true}.to_json
		    account_template = FactoryGirl.create(:account_template, :account => account, :template_inputs => template_inputs)
			expect(account_template.apply_template).to raise_error
		end

	end

	describe "#create_dashboards" do

		before(:each) do
		    @account = FactoryGirl.create(:account)
		    @user = FactoryGirl.create(:user, :account => @account)
      		User.stub(:current_user).and_return(@user)
		    template_inputs={:store_name => "test store", :store_url => "test url", :api_token => "testtoken", :sales => true}.to_json
		    @account_template = FactoryGirl.create(:account_template, :account => @account, :template_inputs => template_inputs)
	  	end

		it "should create dashboards" do
			count = Dashboard.all.count
			@account_template.apply_template
 			expect(Dashboard.all.count).to be > count
		end

		it "should raise exception if unable to create dashboard" do
			@account_template.stub(:id).and_return(nil)
			expect(@account_template.apply_template).to raise_error
		end

	end

	describe "#create_charts" do

		before(:each) do
		    @account = FactoryGirl.create(:account)
		    @user = FactoryGirl.create(:user, :account => @account)
      		User.stub(:current_user).and_return(@user)
		    template_inputs={:store_name => "test store", :store_url => "test url", :api_token => "testtoken", :sales => true}.to_json
		    @account_template = FactoryGirl.create(:account_template, :account => @account, :template_inputs => template_inputs)
	  	end

		it "should create charts" do
			count = Chart.all.count
			@account_template.apply_template
 			expect(Chart.all.count).to be > count
		end

		it "should raise exception if unable to create chart" do
			@account_template.stub(:id).and_return(nil)
			expect(@account_template.apply_template).to raise_error
		end

		it "should create charts_data_source entry for each chart" do
			count = ChartsDataSource.all.count
			@account_template.apply_template
 			expect(ChartsDataSource.all.count).to be > count
		end

		it "should create dimensions entry for chart" do
			count = Dimension.all.count
			@account_template.apply_template
 			expect(Dimension.all.count).to be > count
		end

		it "should create measures entry for chart" do
			count = Measure.all.count
			@account_template.apply_template
 			expect(Measure.all.count).to be > count
		end
	end
end
