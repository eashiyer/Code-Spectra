class MeasuresController < AuthController
    before_filter :auth_only! 

	def index
		if params[:ids]
			@chart_measures = Measure.find_all_by_id(params[:ids])
		elsif params[:chart_id]
			@chart_measures = Measure.find_all_by_charts_data_source_id(params[:chart_id])
		else
	      Rails.logger.debug "Bad request. Can not return all chart filters!"
	      render json: {}, status: 400
	      return	
		end

		render :json => @chart_measures
	end

	def show
        @chart_measure = Measure.find params[:id]
        render :json => @chart_measure
	end

	def update
	  	@measure = Measure.find params[:id]
    	if @measure.update_attributes params[:measure]
			render :json => @measure
		else
	  		Rails.logger.debug @measure.errors.full_messages.join("\n")
	  		render :json => {:errors => { :display_name => @measure.errors.full_messages }}, :status => 422
		end   
	end

	def destroy
		@measure = Measure.find(params[:id])
		@measure.destroy
	    respond_to do |format|
	      format.html { redirect_to applications_url }
	      format.json { head :no_content }
	    end  		
	end
end