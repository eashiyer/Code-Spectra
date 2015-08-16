require 'spec_helper'

describe SessionsController do
  before(:each) do
  	@user = FactoryGirl.create(:user)
    @request.env['devise.mapping'] = Devise.mappings[:user]
    @user.ensure_authentication_token!
  end

  describe 'POST create' do
    context 'no param' do
      before { post :create }

      it 'returns http 400' do
        response.response_code.should == 400
      end
    end

    context 'wrong credentials' do
      before { post :create, email: @user.email, password: '' }

      it 'returns http 401' do
        response.response_code.should == 401
      end
    end

    context 'normal email + password auth' do
      before { post :create, email: @user.email, password: @user.password }
      subject { JSON.parse response.body }

      it 'includes user id' do should include 'user_id' end
      it 'includes auth token' do should include 'auth_token' end

      it 'returns http 201' do
        response.response_code.should == 201
      end
    end

    context 'remember token auth' do
      it 'auth response' do # uses shread example here
        @user.remember_me!
        data = User.serialize_into_cookie(@user)
        token = "#{data.first.first}-#{data.last}"
        @params =  { remember_token: token }
        
      end
    end    
  end

  describe 'DELETE destroy' do
    context 'no param' do
      before { delete :destroy }

      it 'returns http 400' do
        response.response_code.should == 400
      end
    end

    context 'wrong credentials' do
      before { delete :destroy, auth_token: '' }

      it 'returns http 401' do
        response.response_code.should == 401
      end
    end

    context 'normal auth token param' do
      before { delete :destroy, auth_token: @user.authentication_token }
      subject { JSON.parse response.body }

      it 'includes user id' do
        should include 'user_id'
      end

      it 'returns http 200' do
        response.response_code.should == 200
      end
    end
  end
end
