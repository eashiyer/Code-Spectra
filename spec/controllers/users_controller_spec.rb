require 'spec_helper'

describe UsersController do
  describe 'Valid Users' do
    before (:each) do
      @user = FactoryGirl.create(:user)
      sign_in @user
    end

    describe "GET 'show'" do
      
      it "should be successful" do
        get :show, :id => @user.id, :format => :json
        response.should be_success
      end
      
      it "should find the right user" do
        get :show, :id => @user.id
        assigns(:user).should == @user
      end
    end
  end
end
