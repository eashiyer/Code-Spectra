class DimensionsController < AuthController
    before_filter :auth_only! 

	def index
		if params[:ids]
			@chart_dimensions = Dimension.find_all_by_id(params[:ids])
		elsif params[:chart_id]
			@chart_dimensions = Dimension.find_all_by_chart_id(params[:chart_id])
		else
	      Rails.logger.debug "Bad request. Can not return all chart filters!"
	      render json: {}, status: 400
	      return	
		end

		render :json => @chart_dimensions
	end

	def show
        @chart_dimensions = Dimension.find params[:id]
        render :json => @chart_dimensions
	end

	def update
	  	@dimension = Dimension.find params[:id]
    	if @dimension.update_attributes params[:dimension]
			render :json => @dimension
		else
	  		Rails.logger.debug @dimension.errors.full_messages.join("\n")
	  		render :json => {:errors => { :display_name => @dimension.errors.full_messages }}, :status => 422
		end   
	end

  def destroy
	@dimension = Dimension.find(params[:id])
	@dimension.destroy
    respond_to do |format|
      format.html { redirect_to applications_url }
      format.json { head :no_content }
    end  	
  end
end