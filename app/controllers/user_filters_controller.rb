class UserFiltersController < AuthController
	before_filter :auth_only!	

	def index
		if params[:ids]
			@user_filters = UserFilter.find_all_by_id(params[:ids])
		elsif params[:user_id]
			@user_filters = UserFilter.find_all_by_user_id(params[:user_id])
		elsif params[:data_source_id]
			@user_filters = UserFilter.find_all_by_data_source_id(params[:data_source_id])
		else
	      Rails.logger.debug "Bad request. Can not return all user filters!"
	      render json: {:error => "Bad request. Can not return all user filters!"}, status: 400
	      return	
		end

		render :json => @user_filters
	end

	def show
	end

	def update
        unless current_user.is_admin?
          render json: {:error => "Only an administrator of the account can perform this action!"}, status: 401    
          return
        end
	
		@user_filter = UserFilter.find params[:id]
        if @user_filter.update_attributes(params[:user_filter]) 
            render json: @user_filter
        else
            render json: {:error => @user_filter.errors.full_messages.join("\n")}, status: 401
        end

	end

	def create
		begin
	        unless current_user.is_admin?
	          render json: {:error => "Only an administrator of the account can perform this action!"}, status: 401    
	          return
	        end

			@user_filter = UserFilter::create!(params[:user_filter])

		    if @user_filter
		      render :json => @user_filter
		    else
		      Rails.logger.debug @user_filter.errors.full_messages.join("\n")
		      render json: {:error => "Unable to create a user filter."}, status: 401
		    end		
		rescue Exception => e
			Rails.logger.error "\nERROR: #{e} \n"
			  render json: {:error => "Unable to create a user filter. #{e}"}, status: 401
		end
	end

	def destroy
        unless current_user.is_admin?
          render json: {:error => "Only an administrator of the account can perform this action!"}, status: 401    
          return
        end

        @user_filter = UserFilter.find(params[:id])
        @user_filter.destroy 

        respond_to do |format|
          format.html { redirect_to root_url }
          format.json { head :no_content }
        end

	end
end
