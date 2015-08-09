class AccountTemplatesController < AuthController
	before_filter :auth_only!

	def index
		if params[:ids]
			@account_template = AccountTemplate.find_all_by_id(params[:ids])
		elsif params[:account_id]
			@account_template = AccountTemplate.find_all_by_account_id(params[:account_id])
		else
	      Rails.logger.debug "Bad request."
	      render json: {}, status: 400
	      return	
		end

		render :json => @account_template
	end

	def show
		if params[:id] == "0"
			@account_template = current_user.account.account_templates
		else
        	@account_template = AccountTemplate.find params[:id]
        end
        render :json => @account_template
	end

	def create
		unless params[:account_template][:account_id] 
    		render json: {}, status: 400
    		return
    	end

    	unless params[:account_template][:account_id].to_i == current_user.account_id 
    		render json: {}, status: 401
    		return
    	end

    	unless current_user.is_admin?
    		render json: {}, status: 401
    		return
    	end
    	ActiveRecord::Base.transaction do
    		begin
    			@account_template = AccountTemplate.new params[:account_template]
				if @account_template.save
					@account_template.apply_template
			        render json: @account_template
			    else
			    	raise @account_template.errors.full_messages.join("\n")
			    end
    		rescue Exception => e
    			Rails.logger.debug e.message
    			render :json => {:errors => {:template_name => e.message} }, :status => 422
		        raise ActiveRecord::Rollback
    		end	        
	    end
	end

	def destroy
		@account_template = AccountTemplate.find(params[:id])
        @account_template.destroy 

        respond_to do |format|
          format.html { redirect_to root_url }
          format.json { head :no_content }
        end
	end
end