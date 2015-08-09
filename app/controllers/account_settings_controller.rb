class AccountSettingsController < AuthController
	before_filter :auth_only!

	def index
		if params[:id]
			@account_setting = AccountSetting.find_all_by_id(params[:id])
		elsif params[:account_id]
			@account_setting = AccountSetting.find_all_by_account_id(params[:account_id])
		else
	      Rails.logger.debug "Bad request."
	      render json: {}, status: 400
	      return	
		end

		render :json => @account_setting
	end

	def show
		if params[:id] == "0"
			@account_setting = current_user.account.account_setting
		else
        	@account_setting = AccountSetting.find params[:id]
        end
        render :json => @account_setting
	end

	def create
		@account_setting = AccountSetting.find_or_initialize_by_account_id(params[:account_setting][:account_id]) if params[:account_setting][:account_id]

	    if @account_setting
	      render :json => @account_setting
	    else
	      #Rails.logger.debug @account_setting.errors.full_messages.join("\n")
	      render json: {}#, status: 401
	    end		
	end

	def update
		@account_setting = AccountSetting.find params[:id]
		if params[:account_setting][:company_new_logo]
			params[:account_setting][:company_logo] = params[:account_setting][:company_new_logo]
		else
			params[:account_setting].delete(:company_logo)
		end
	  	params[:account_setting].delete(:company_new_logo)
        if @account_setting.update_attributes(params[:account_setting]) 
            render json: @account_setting
        else
            render json: @account_setting.errors.full_messages.join("\n")
        end
	end

	def destroy
        @account_setting = AccountSetting.find(params[:id])
        @account_setting.destroy 

        respond_to do |format|
          format.html { redirect_to root_url }
          format.json { head :no_content }
        end
	end

	def upload_logo
		account_id = User.find(params[:user_id]).account_id
		@account_setting = AccountSetting.find_or_initialize_by_account_id(account_id)
		@account_setting.company_logo = params[:files].first
		if @account_setting.save
			render :json => {'url' => @account_setting.company_logo.url(:medium)}, status: 200
		else
			render :json => {:error => 'Unable to save'}, status:422
		end
	end
	
	def remove_logo
		account_id = User.find(params[:user_id]).account_id
		@account_setting = AccountSetting.find_by_account_id(account_id)
		@account_setting.company_logo = nil
		if @account_setting.save
			render :json => {'url' => @account_setting.company_logo.url(:medium)}, status: 200
		else
			render :json => {:error => 'Failed'}, status:422
		end
	end

end