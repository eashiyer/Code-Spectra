require 'spec_helper'

describe VerticalsController do
	describe "Basic User" do
		before do
			@account = FactoryGirl.create(:account)
			@user = FactoryGirl.create(:user, :account => @account)
			@vertical = FactoryGirl.create(:vertical, :account => @account)						
			@permission = FactoryGirl.create(:permission, :user => @user, :permissible => @vertical, :role => "basic")
		end
	
		describe "Get Index" do
			context "unauthorized access" do
				before { get :index }
		      	it 'returns http 401' do
		        	response.response_code.should == 401
		      	end		

			end
		    context 'authorized' do
		      before do
		        @user.ensure_authentication_token!
		        get :index, auth_token: @user.authentication_token
		      end
		      subject { JSON.parse response.body }

		      it 'wraps around verticals' do should include 'verticals' end

		      it 'returns http 200' do
		        response.response_code.should == 200
		      end
		    end
		end

		describe 'GET show' do
			context 'unauthenticated access' do
			  before { get :show, id: @vertical.id }

			  it 'returns http 401' do
			    response.response_code.should == 401
			  end
			end

			context 'authorized access to vertical in same account' do
			  before do
			    @user.ensure_authentication_token!
			    get :show, id: @vertical.id, auth_token: @user.authentication_token
			  end
			  subject { JSON.parse response.body }

			  it 'wraps around vertical' do should include 'vertical' end
			  context 'inside vertical' do
			    subject { (JSON.parse response.body)['vertical'] }
			    it { should include 'id' }
			    it { should include 'name' }
			    it { should include 'dashboard_ids' }
			  end

			  it 'returns http 200' do
			    response.response_code.should == 200
			  end
			end

			context 'authenticated access to vertical in other account' do
			  before do
			  	@vertical2 = FactoryGirl.create(:vertical, :account => FactoryGirl.create(:account))
			    @user.ensure_authentication_token!
			    get :show, id: @vertical2.id, auth_token: @user.authentication_token
			  end
			  subject { JSON.parse response.body }

			  it 'returns http 401' do
			    response.response_code.should == 401
			  end
			end
		end

		describe 'PUT update' do
			before do
				@user.ensure_authentication_token!
				put :update, id: @vertical.id, auth_token: @user.authentication_token, name: 'new_name'
			end
			it "returns http 401" do
				response.response_code.should == 401
			end
		end

		describe 'POST create' do
			before do
				@user.ensure_authentication_token!
				post :create, auth_token: @user.authentication_token, vertical: {name: 'New Vertical', :account_id => @account.id}
			end
			it "returns http 401" do
				response.response_code.should == 401
			end
		end

	end

	describe "Manager User" do	
		before do
			@account = FactoryGirl.create(:account)
			@user = FactoryGirl.create(:user, :account => @account)
			@vertical = FactoryGirl.create(:vertical, :account => @account)
			@permission = FactoryGirl.create(:permission, :user => @user, :permissible => @vertical, :role => "manager")
		end

		describe 'PUT update' do
			before do
				@user.ensure_authentication_token!
				put :update, id: @vertical.id, auth_token: @user.authentication_token, :vertical => { name: 'new_name' }
			end
			it "returns http 401" do
				response.response_code.should == 200
			end

			it "returns new_name" do
				res = JSON.parse(response.body)
				expect(res["vertical"]["name"]).to eq("new_name")
			end
		end

		context 'Update vertical in other account' do
		  before do
		  	@vertical2 = FactoryGirl.create(:vertical, :account => FactoryGirl.create(:account))
		    @user.ensure_authentication_token!
		    put :update, id: @vertical2.id, auth_token: @user.authentication_token, :vertical => { name: 'new_name' }
		  end
		  subject { JSON.parse response.body }

		  it 'returns http 401' do
		    response.response_code.should == 401
		  end
		end


		describe 'POST delete' do
			before do
				@user.ensure_authentication_token!
				post :destroy, id: @vertical.id, auth_token: @user.authentication_token
			end
			it "returns http 401" do
				response.response_code.should == 401
			end
		end

		describe 'POST create' do
			before do
				@user.ensure_authentication_token!
				post :create, auth_token: @user.authentication_token, vertical: {name: 'New Vertical', :account_id => @account.id}
			end
			it "returns http 401" do
				response.response_code.should == 401
			end
		end
		
	end

	describe "For Account Admin" do
		before do
			@account = FactoryGirl.create(:account)
			@user = FactoryGirl.create(:user, { :account => @account, :is_admin => true })

		end

		describe "Authorized Access" do
			before do
				@user.ensure_authentication_token!
				# Same Account
				@vertical = FactoryGirl.create(:vertical, :account => @account)

				# Different Account
				@vertical2 = FactoryGirl.create(:vertical, :account => FactoryGirl.create(:account))
			end

			describe 'GET show vertical from own account' do
				before do
					get :show, id: @vertical.id, auth_token: @user.authentication_token
				end
				it "should return http 200 code" do
					response.response_code.should == 200
				end
			end

			describe 'GET show vertical from other account' do
				before do
					get :show, id: @vertical2.id, auth_token: @user.authentication_token
				end
				it "should return http 200 code" do
					response.response_code.should == 401
				end
			end

			describe 'PUT update vertical from own account' do
				before do
					put :update, id: @vertical.id, auth_token: @user.authentication_token, :vertical => { name: 'new_name' }
				end
				it "should return http 200 code" do
					response.response_code.should == 200
				end

				it "should return http 200 code" do
					res = JSON.parse(response.body)
					res["vertical"]["name"].should == "new_name"
				end
			end

			describe 'PUT update vertical from other account' do
				before do
					put :update, id: @vertical2.id, auth_token: @user.authentication_token, :vertical => { name: 'new_name' }
				end
				it "should return http 401 code" do
					response.response_code.should == 401
				end

				it "should return empty hash" do
					res = JSON.parse(response.body)
					res.length.should == 0
				end
			end

			describe 'POST delete vertical from own account' do
				before do
					post :destroy, id: @vertical.id, auth_token: @user.authentication_token
				end
				it "should return http 200 code" do
					response.response_code.should == 204
				end

			end

			describe 'POST delete vertical from other account' do
				before do
					post :destroy, id: @vertical2.id, auth_token: @user.authentication_token
				end
				it "should return http 401 code" do
					response.response_code.should == 401
				end
			end

			describe 'POST create without account_id' do
				before do
					post :create, auth_token: @user.authentication_token, vertical: {name: 'New Vertical'}
				end

				it "Should return 400 http code" do
					response.response_code.should == 400
				end
			end

			describe 'POST create with valid account_id' do
				before do
					post :create, auth_token: @user.authentication_token, vertical: {name: 'New Vertical', :account_id => @account.id}
				end

				it "Should return 400 http code" do
					response.response_code.should == 200
				end

				it "Should return correct hash" do
					res = JSON.parse(response.body)
					res["vertical"]["name"].should == "New Vertical"
				end

			end

			describe 'POST create with wrong account_id' do
				before do
					account = FactoryGirl.create(:account)
					post :create, auth_token: @user.authentication_token, vertical: {name: 'New Vertical', :account_id => account.id}
				end

				it "Should return 400 http code" do
					response.response_code.should == 401
				end

				it "Should return correct hash" do
					res = JSON.parse(response.body)
					res.length == 0
				end

			end			
		end
	end
end
