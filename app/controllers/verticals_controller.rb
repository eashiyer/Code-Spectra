class VerticalsController < AuthController
	before_filter :auth_only! 
	before_filter :check_authorization, :except => [:index, :create]
	
	def index
		# @verticals = Vertical.all(:conditions => ['is_hidden = false'])
		@verticals = current_user.verticals
		render :json => @verticals
	end

	def show
		@vertical = Vertical.find(params[:id])
		unless @vertical.account_id == current_user.account_id
			render json: {}, status: 401 
			return
		end
		render :json => @vertical
	end

    def create
    	unless params[:vertical][:account_id] 
    		render json: {}, status: 400
    		return
    	end

    	unless params[:vertical][:account_id].to_i == current_user.account_id 
    		render json: {}, status: 401
    		return
    	end

    	unless current_user.is_admin?
    		render json: {}, status: 401
    		return
    	end

		if params[:vertical].has_key?(:custom_icon_url)
			params[:vertical].delete(:custom_icon_url)        
		end

        @vertical = Vertical.new params[:vertical]
		if @vertical.save
            render json: @vertical
        else
            logger.debug @vertical.errors.full_messages.join("\n")
            render :json => {:errors => { :name => 'Vertical limit exceeded' }}, :status => 422
        end
    end

	def destroy
		@vertical = Vertical.find params[:id]
		unless @vertical.account_id == current_user.account_id
			render json: {}, status: 401 
			return
		end

		@vertical.destroy

		respond_to do |format|
			format.html { redirect_to root_url }
			format.json { head :no_content }
		end
	end

	def update
		if params[:vertical].has_key?(:custom_icon_url)
			params[:vertical].delete(:custom_icon_url)        
		end
		@vertical = Vertical.find params[:id]
		unless @vertical.account_id == current_user.account_id
			render json: {}, status: 401 
			return
		end

		if @vertical.update_attributes(params[:vertical])
      		render :json => @vertical
      	else
			Rails.logger.debug @vertical.errors.full_messages.join("\n")
        	render :json => {
        		'message' => 'unable to save'
        	}
      	end
	end
end
