require 'spec_helper'

describe DashboardsController do
	describe "Vertical Admin User" do
		before do
			@user = FactoryGirl.create(:user)
			@vertical = FactoryGirl.create(:vertical)
			@permission = FactoryGirl.create(:permission, :user => @user, :permissible => @vertical, :role => "admin")
		end

		describe 'POST create' do
			before do
			    @request.env["devise.mapping"] = Devise.mappings[:admin]
			    sign_in @user
			    
			    @attr = { :dashboard => 
			    			{   :vertical_id => @vertical.id, 
			    				:title =>	'New Vertical',
			    				:display_name => 'New Vertical'
			    			} 
			    		}  
			    post :create, @attr
			end

			it "should create a new vertical" do
				response.response_code.should == 200
			end
		end
	end

	describe "Vertical Manager User" do
		before do
			@user = FactoryGirl.create(:user)
			@vertical = FactoryGirl.create(:vertical)
			@permission = FactoryGirl.create(:permission, :user => @user, :permissible => @vertical, :role => "manager")
		end

		describe 'POST create' do
			before do
			    @request.env["devise.mapping"] = Devise.mappings[:admin]
			    sign_in @user
			    
			    @attr = { :dashboard => 
			    			{   :vertical_id => @vertical.id, 
			    				:title =>	'New Vertical',
			    				:display_name => 'New Vertical'
			    			} 
			    		}  
			    post :create, @attr
			end

			it "should create a new vertical" do
				response.response_code.should == 200
			end
		end
	end

	describe "Vertical Basic User" do
		before do
			@user = FactoryGirl.create(:user)
			@vertical = FactoryGirl.create(:vertical)
			@permission = FactoryGirl.create(:permission, :user => @user, :permissible => @vertical, :role => "basic")
		end

		describe 'POST create' do
			before do
			    @request.env["devise.mapping"] = Devise.mappings[:admin]
			    sign_in @user
			    
			    @attr = { :dashboard => 
			    			{   :vertical_id => @vertical.id, 
			    				:title =>	'New Vertical',
			    				:display_name => 'New Vertical'
			    			} 
			    		}  
			    post :create, @attr
			end

			it "should create a new vertical" do
				response.response_code.should == 401
			end
		end
	end
end
