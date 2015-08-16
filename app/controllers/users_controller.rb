class UsersController < ApplicationController
	before_filter :authenticate_user!
	before_filter :checkUserObject , :only => :update
	before_filter :generate_api_access_token, :only => :update

	def checkUserObject
	  	params[:user].delete('user_permissions')
	  	params[:user].delete('user_color_preference_id')
	  	params[:user].delete('company_logo_url')
	  	params[:user].delete('logo_width')
	  	params[:user].delete('color_palette')
	end

	def generate_api_access_token
		if params[:user].has_key?(:has_api_access)
			user=User.find(params[:id])
			if user.has_api_access != params[:user][:has_api_access]
				if params[:user][:has_api_access] == true
					params[:user][:api_access_token] = Digest::MD5.hexdigest(Time.now.to_s)
				else
					params[:user][:api_access_token] = nil
				end
			end
		end
	end

	def index
		@users = current_user.account.users
		render :json => @users
	end

	def show
		@user = User.find(params[:id])
		render :json => @user
	end

	def update
		@user = User.find params[:id]
		if @user.update_attributes params[:user]
			render :json => @user
		else
	  		Rails.logger.debug @user.errors.full_messages.join("\n")
	  		render :json => {:errors => { :password => @user.errors.full_messages }}, :status => 422
		end   
	end

	def destroy
		@user = User.find(params[:id])
		if @user.destroy
			respond_to do |format|
	          format.json { head :no_content }
	        end
		else
			Rails.logger.debug @user.errors.full_messages.join("\n")
	  		render :json => {
	   			'message' => 'unable to delete'
	   		}
		end
	end

end