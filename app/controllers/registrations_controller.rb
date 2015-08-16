
class RegistrationsController < Devise::RegistrationsController
	before_filter :checkUserObject , :only => :create

	def checkUserObject
		params[:user][:password] = "#{ params[:user][:first_name]}#{ params[:user][:last_name]}#{params[:user][:account_id]}"
	  	params[:user].delete('user_permissions')
	  	params[:user].delete('user_color_preference_id')
	  	params[:user].delete('company_logo_url')
	  	params[:user].delete('logo_width')
	  	params[:user].delete('color_palette')
	  	# debugger
	  	# password=SecureRandom.urlsafe_base64(9)
	  	
	end
end