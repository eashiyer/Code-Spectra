class SessionsController < Devise::SessionsController

	# before_filter :isExpired, :only => [:create]

	def is_expired
		if params[:email]  			  			
	  		user=User.find_by_email(params[:email])
	  		account=user.account
	  		if account.time_limit && account.time_limit<=Time.now.utc
	  			return true
	  		else
	  			return false	 
	  		end
	  	end
	end

  	def create
  		unless (params[:email] && params[:password]) || (params[:remember_token] || params[:sso_token] || params[:backend_secret_token]) 
    		return missing_params
  		end  		

  		@params = params
	  	if !params[:referrer]
	  		build_resource
		  	resource = 	if params[:remember_token]
	               			resource_from_remember_token
	               		elsif params[:sso_token] && params[:client_id]
	               			resource_from_authentication_server
	               		elsif params[:backend_secret_token]
	               			resource_from_backend_secret_token
	             		else
	               			resource_from_credentials
	             		end
		  	return invalid_credentials unless resource
			resource.ensure_authentication_token!
			data = {
				user_id: resource.id,
			    auth_token: resource.authentication_token,
			}
		    if params[:remember] || params[:referrer] 
		  		resource.remember_me!
		  		data[:remember_token] = remember_token(resource)
		  	end		

	  		render json: data, status: 201		
	  	end
  	end

  	def destroy
  		return missing_params unless params[:auth_token]
		resource = resource_class.find_by_authentication_token(params[:auth_token])
		return invalid_credentials unless resource
		resource.reset_authentication_token!
		$redis.del("rtoken-#{resource.id}")
		render json: {user_id: resource.id}, status: 200
  	end

  	def authorize		
	  	data = { email: params[:email] }
	  	if res = resource_class.find_for_database_authentication(data)
	    	if res.api_access_token == params[:api_access_token]
		    	if !is_expired
		      		render json: {email: res[:email], cibi_token: res[:authentication_token]}, status: 200
		  		end
		  	else
		  		render json: {message: "The access token passed does not have sufficient privileges to execute API calls. Please check the access token and try again."}, status: 401
	    	end
	  	end
	end

	protected

	def resource_from_credentials		
	  data = { email: params[:email] }
	  if res = resource_class.find_for_database_authentication(data)
	    if res.valid_password?(params[:password])
		    #if !is_expired
		      res
		  	#end
	    end
	  end
	end 

	def resource_from_remember_token
		token = params[:remember_token]
		id, identifier = token.split('-')
		token = $redis.get("rtoken-#{id}")
		if(token && token == identifier)
			resource_class.find(id)
		end
	  #resource_class.serialize_from_cookie(id, identifier)
	end

	def resource_from_backend_secret_token
		resource_class.find_by_authentication_token(params[:backend_secret_token])	
	end

	def resource_from_authentication_server
		sso_token = params[:sso_token]
		client_id = params[:client_id]
		# debugger
		cached_response = $redis.get(sso_token)
		if cached_response
			cached_response = JSON.parse(cached_response)
			if cached_response["expire_token_at"] && Time.now > cached_response["expire_token_at"]
				$redis.del(sso_token)
				return
			end
			res = resource_class.find_by_email(cached_response["email"])
			return res
		end

		auth_server = AuthServer::get_auth_server(client_id)
		
		return if auth_server.nil?

		curl = nil
		curl = Curl::Easy.http_post(auth_server.auth_server_url, nil) do |c|
			c.headers['Authorization'] = "Bearer #{sso_token}"
			c.timeout = 300
		end
		# debugger
		if curl.response_code == 200
			response_str = JSON.parse(curl.body_str)
			
			return if response_str.nil?

			email = response_str["email"] || response_str["id"]["email"]
			expire_token_in = response_str["expires_in"] || response_str["id"]["expires_in"]
			expire_token_at = Time.now + expire_token_in.to_i.seconds
			
			if response_str.has_key?("refresh_token")
				refresh_token = response_str["refresh_token"]
			end
			
			res = resource_class.find_by_email(email)
			if res.account_id == auth_server.account_id
				# debugger
				if expire_token_in.to_i != 0
					cache_sso_token = {"email" => email, "expire_token_at" => expire_token_at}
					$redis.set(sso_token, cache_sso_token.to_json)
					if refresh_token
						$redis.set("refresh_token-#{client_id}", refresh_token)
					end
				end
				return res
			# elsif curl.response_code == 401
			# 	error_str = JSON.parse(curl.body_str)
			# 	return error_str["error"]["message"]
			end
		end

	end

	def missing_params
	  warden.custom_failure!
	  return render json: {}, status: 400
	end

	def invalid_credentials
	  warden.custom_failure!
	  render json: {}, status: 401
	end

	def build_resource(hash=nil)
		self.resource = resource_class.new_with_session(hash || {}, session)
	end	

	def remember_token(resource)
		data = resource_class.serialize_into_cookie(resource)
		$redis.set("rtoken-#{data.first.first}", "#{data.last}")
  		"#{data.first.first}-#{data.last}"
	end

	def session_exists?(resource)
		session["session-#{resource.id}"]
	end
end