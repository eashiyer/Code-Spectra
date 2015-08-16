class AuthController < BaseController

    protected

    def auth_only!
    	if params[:cibi_token]
    		u = User.find_by_authentication_token(params[:cibi_token])
    		unless u
                return render json: {message: 'Unauthorized user'}, status: 401
            end
    	else
	   	    unless user_signed_in? && current_user && self.params[:auth_token]==current_user.authentication_token
		      	return render json: {message: 'Unauthorized user'}, status: 401
		    end
		end
    end
end