require 'spec_helper'

describe PermissionsController do
  describe "Admin User" do
    before(:each) do
      @account = FactoryGirl.create(:account)
      @user = FactoryGirl.create(:user, {:is_admin => true, :account => @account})
      @request.env["devise.mapping"] = Devise.mappings[:admin]
      sign_in @user
    end

    describe "GET permissions for a user" do
      before(:each) do
        @user2 = FactoryGirl.create(:user, {:account => @account})
        @dashboard = FactoryGirl.create(:dashboard)
        @vertical = FactoryGirl.create(:vertical, :account => @account)

        @permission = FactoryGirl.create(:permission, 
                        :user => @user,
                        :permissible => @dashboard,
                        :role => "admin"
                      )
        @permission2 = FactoryGirl.create(:permission, 
                        :user => @user2,
                        :permissible => @vertical,
                        :role => "manager"
                      )
        
        get 'index', {:user_id => @user.id}
        @permissions = JSON.parse(response.body)
      end

      it "returns http success" do
        response.should be_success
      end

      it "returns permissions only belonging to the correct user" do
        expect(@permissions.length).to eq(1)
      end

      it "returns correct http response" do
        expect(@permissions["permissions"][0]["id"]).to eq(@permission.id)
        expect(@permissions["permissions"][0]["user_id"]).to eq(@user.id)
        expect(@permissions["permissions"][0]["role"]).to eq(@permission.role)
      end
    end

    describe "GET permissions for a vertical" do
      before(:each) do
        @user2 = FactoryGirl.create(:user, :account => @account)
        @dashboard = FactoryGirl.create(:dashboard)
        @vertical = FactoryGirl.create(:vertical, :account => @account)

        @permission = FactoryGirl.create(:permission, 
                        :user => @user,
                        :permissible => @dashboard,
                        :role => "admin"
                      )
        @permission2 = FactoryGirl.create(:permission, 
                        :user => @user2,
                        :permissible => @vertical,
                        :role => "manager"
                      )
        
        get 'index', {:vertical_id => @vertical.id}
        @permissions = JSON.parse(response.body)
      end

      it "returns http success" do
        response.should be_success
      end

      it "returns only the permissions related to vertical" do
        expect(@permissions.length).to eq(1)
      end

      it "returns correct http response" do
        expect(@permissions["permissions"][0]["id"]).to eq(@permission2.id)
        expect(@permissions["permissions"][0]["user_id"]).to eq(@user2.id)
        expect(@permissions["permissions"][0]["role"]).to eq(@permission2.role)
      end
    end

    describe "GET permissions for a dashboard" do
      before(:each) do
        @user2 = FactoryGirl.create(:user, :account => @account)
        @dashboard = FactoryGirl.create(:dashboard)
        @vertical = FactoryGirl.create(:vertical, :account => @account)

        @permission = FactoryGirl.create(:permission, 
                        :user => @user,
                        :permissible => @dashboard,
                        :role => "admin"
                      )
        @permission2 = FactoryGirl.create(:permission, 
                        :user => @user2,
                        :permissible => @vertical,
                        :role => "manager"
                      )
        
        get 'index', {:dashboard_id => @dashboard.id}
        @permissions = JSON.parse(response.body)
      end

      it "returns http success" do
        response.should be_success
      end

      it "returns only the permissions related to vertical" do
        expect(@permissions.length).to eq(1)
      end

      it "returns correct http response" do
        expect(@permissions["permissions"][0]["id"]).to eq(@permission.id)
        expect(@permissions["permissions"][0]["user_id"]).to eq(@user.id)
        expect(@permissions["permissions"][0]["role"]).to eq(@permission.role)
      end
    end

    describe "GET 'show'" do
      before(:each) do
        @permission = FactoryGirl.create(:permission)
      end
      it "returns http success" do
        get 'show', :id => @permission.id
        response.should be_success
      end
    end

    describe "POST 'update'" do
      before(:each) do
        @user2 = FactoryGirl.create(:user, :account => @account)
        @vertical = FactoryGirl.create(:vertical, :account => @account)
        @permission = FactoryGirl.create(:permission, :role => "basic", :permissible => @vertical, :user => @user2)
      end

      it "should update permission correctly" do
        put :update, :id => @permission.id, :permission => {:role => "admin"}
        permission_response = JSON.parse(response.body)        
        expect(permission_response["permission"]["role"]).to eq("admin")
      end
    end

    describe "POST 'create'" do
      it "should create permission correctly" do
        @vertical = FactoryGirl.create(:vertical, :account => @account)

        post :create, :permission => {:user_id => 1, :permissible_type => 'Vertical', :permissible_id => @vertical.id, :role => "manager"}
        permission_response = JSON.parse(response.body)
        expect(permission_response["permission"]["role"]).to eq("manager")
        expect(permission_response["permission"]["permissible_type"]).to eq("Vertical")
        expect(permission_response["permission"]["permissible_id"]).to eq(@vertical.id)
        expect(permission_response["permission"]["user_id"]).to eq(1)
      end
    end
  end

  describe "Manager User" do
    before(:each) do
      @account = FactoryGirl.create(:account)
      @user = FactoryGirl.create(:user, { :is_admin => false, :account => @account })
      @request.env["devise.mapping"] = Devise.mappings[:admin]
      sign_in @user
    end

    describe "POST 'update'" do
      before(:each) do
        @vertical = FactoryGirl.create(:vertical, :account => @account)
        @permission = FactoryGirl.create(:permission, :role => "basic", :permissible_type => "Vertical", :permissible_id => @vertical.id)
        put :update, :id => @permission.id, :permission => {:role => "admin"}
        @permission_response = JSON.parse(response.body)
        @permission_response_code = response.code
      end

      it "should update permission correctly" do
        expect(@permission_response).to eq({})
      end

      it "should update permission correctly" do
        expect(@permission_response_code).to eq("401")
      end
    end
  end
end
