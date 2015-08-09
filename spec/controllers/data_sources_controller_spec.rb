require 'spec_helper'

describe DataSourcesController do

	describe "For Account Admin" do
		before do
			@account = FactoryGirl.create(:account)
			@user = FactoryGirl.create(:user, { :account => @account, :is_admin => true })

		end

		describe "Authorized Access" do
			before do
				@user.ensure_authentication_token!
				# Same Account
				@data_source1 = FactoryGirl.create(:data_source, :account => @account)

				# Different Account
				@data_source2 = FactoryGirl.create(:data_source, :account => FactoryGirl.create(:account))
			end

			describe 'GET index' do
				before do
					get :index, auth_token: @user.authentication_token
					@res = JSON.parse(response.body)
				end

				it "should return HTTP status code 200" do
					response.response_code.should == 200
				end

				it "should return only data source from your own account" do								
					@res['data_sources'].length.should == 1
				end

				it "should return only data source from your own account" do								
					@res['data_sources'][0]["id"].should == @data_source1.id
				end

			end

			describe 'GET show for data source of other account' do
				before do
					get :show, auth_token: @user.authentication_token, id: @data_source2.id
					@res = JSON.parse(response.body)
				end
				it "should return HTTP status code 401" do
					response.response_code.should == 401
				end

				it "should return an empty hash" do								
					@res.length.should == 0
				end
			end			

			describe 'GET show for data source of own account' do
				before do
					get :show, auth_token: @user.authentication_token, id: @data_source1.id
					@res = JSON.parse(response.body)
				end
				it "should return HTTP status code 200" do
					response.response_code.should == 200
				end

				it "should return correct data source object" do								
					@res["data_source"]["id"].should == @data_source1.id
				end
			end			

			describe 'PUT update for data source of other account' do
				before do
					put :update, auth_token: @user.authentication_token, id: @data_source2.id, data_source: { name: "New Name" }
					@res = JSON.parse(response.body)
				end
				it "should return HTTP status code 401" do
					response.response_code.should == 401
				end

				it "should return an empty hash" do								
					@res.length.should == 0
				end
			end			

			describe 'PUT update for data source of own account' do
				before do
					put :update, auth_token: @user.authentication_token, id: @data_source1.id, data_source: { name: "New Name" }
					@res = JSON.parse(response.body)
				end
				it "should return HTTP status code 200" do
					response.response_code.should == 200
				end

				it "should return an empty hash" do								
					@res["data_source"]["name"].should == "New Name"
				end
			end			

			describe 'POST create data_source in own account' do
				before do
					post :create, auth_token: @user.authentication_token, data_source: {name: "New DataSource", data_source_type: "csv", account_id: @account.id}
					@res = JSON.parse(response.body)
				end

				it "should return HTTP status code 200" do
					response.response_code.should == 200
				end

				it "should return new data_source" do								
					@res["data_source"]["name"].should  == 'New DataSource'
				end

				it "should return new data_source with correct account_id" do								
					@res["data_source"]["account_id"].should  == @account.id
				end

			end

			describe 'POST create data_source without valid account' do
				before do
					post :create, auth_token: @user.authentication_token, data_source: {name: "New DataSource", data_source_type: "csv"}
					@res = JSON.parse(response.body)
				end

				it "should return HTTP status code 400" do
					response.response_code.should == 400
				end

				it "should return empty hash" do								
					@res.length.should  == 0
				end
			end

			describe 'POST create data_source in other account' do
				before do
					account = FactoryGirl.create(:account)
					post :create, auth_token: @user.authentication_token, data_source: {name: "New DataSource", data_source_type: "csv", account_id: account.id}
					@res = JSON.parse(response.body)
				end

				it "should return HTTP status code 401" do
					response.response_code.should == 401
				end

				it "should return new data_source" do								
					@res.length.should  == 0
				end
			end
		end		
	end

	describe "For Account Basic User" do
		before do
			@account = FactoryGirl.create(:account)
			@user = FactoryGirl.create(:user, { :account => @account, :is_admin => false })
		end

		describe "Authorized Access" do
			before do
				# Same Account
				@data_source1 = FactoryGirl.create(:data_source, :account => @account)

				# Different Account
				@data_source2 = FactoryGirl.create(:data_source, :account => FactoryGirl.create(:account))
				@user.ensure_authentication_token!
			end

			describe 'GET index should return only data_sources from own account' do
				before do
					get :index, auth_token: @user.authentication_token
					@res = JSON.parse(response.body)
				end
				it "should return HTTP status code 200" do
					response.response_code.should == 200
				end

				it "should return only 1 data_source" do								
					@res["data_sources"].length.should == 1
				end

				it "should return correct data_source id" do								
					@res["data_sources"][0]["id"].should == @data_source1.id
				end

			end
			
			describe 'GET show data_source from own account' do
				before do
					get :show, auth_token: @user.authentication_token, :id => @data_source1.id
					@res = JSON.parse(response.body)
				end
				it "should return HTTP status code 200" do
					response.response_code.should == 200
				end

				it "should return correct data source" do								
					@res["data_source"]["id"].should == @data_source1.id
				end
			end			

			describe 'GET show data_source from other account' do
				before do
					get :show, auth_token: @user.authentication_token, :id => @data_source2.id
					@res = JSON.parse(response.body)
				end
				it "should return HTTP status code 401" do
					response.response_code.should == 401
				end

				it "should return empty hash" do								
					@res.length.should == 0
				end
			end			

			describe 'PUT update' do
				before do
					put :update, auth_token: @user.authentication_token, :id => @data_source1.id, :name => 'New Name'
					@res = JSON.parse(response.body)
				end
				it "should return HTTP status code 401" do
					response.response_code.should == 401
				end

				it "should return an empty hash" do								
					@res.length.should == 0
				end
			end					

			describe 'POST addContent' do
				before do
					post :addContent, auth_token: @user.authentication_token, :id => @data_source1.id, :files => 'New Content'
					@res = JSON.parse(response.body)
				end

				it "should return HTTP status code 401" do
					response.response_code.should == 401
				end

				it "should return an empty hash" do								
					@res.length.should == 0
				end
			end		

			describe 'POST create' do
				before do
					post :create, {data_source: {name: "New DataSource", data_source_type: "csv"}}, auth_token: @user.authentication_token
					@res = JSON.parse(response.body)
				end

				it "should return HTTP status code 401" do
					response.response_code.should == 401
				end

				it "should return an empty hash" do								
					@res.length.should == 0
				end
			end
		end
	end
end
