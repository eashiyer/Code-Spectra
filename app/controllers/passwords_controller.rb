class PasswordsController < Devise::PasswordsController


	# POST /resource/password
	def create
		self.resource = resource_class.send_reset_password_instructions(resource_params)
		yield resource if block_given?

		if successfully_sent?(resource)
		  #respond_with({}, location: after_sending_reset_password_instructions_path_for(resource_name))
		  render json: {message: "success"}	, status: 200	
		else
		  render json: resource.errors, status: 400	
		  #{"email":["not found"]}
		  #respond_with(resource)
		end
	end

    # PUT /resource/password
	def update
		self.resource = resource_class.reset_password_by_token(resource_params)
		yield resource if block_given?

		if resource.errors.empty?
		  #resource.unlock_access! if unlockable?(resource)
		  #flash_message = resource.active_for_authentication? ? :updated : :updated_not_active
		  #set_flash_message(:notice, flash_message) if is_flashing_format?
		  #sign_in(resource_name, resource)
		  render json: {message: "success"}, status: 200	
		else
		  render json: resource.errors, status: 400	
		  #{"password":["doesn't match confirmation","is too short (minimum is 8 characters)"]}
		end
	end

end