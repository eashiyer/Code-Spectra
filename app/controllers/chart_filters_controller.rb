class ChartFiltersController < AuthController
	before_filter :auth_only!

	def index
		if params[:ids]
			@chart_filters = ChartFilter.find_all_by_id(params[:ids])
		elsif params[:chart_id]
			@chart_filters = ChartFilter.find_all_by_chart_id(params[:chart_id])
		else
	      Rails.logger.debug "Bad request. Can not return all chart filters!"
	      render json: {}, status: 400
	      return	
		end

		render :json => @chart_filters
	end

	def show
        @chart_filter = ChartFilter.find params[:id]
        render :json => @chart_filter
	end

	def create
		if  params[:chart_filter][:lower_range] &&  params[:chart_filter][:upper_range] 
			params[:chart_filter][:lower_range] =  Time.parse(params[:chart_filter][:lower_range]).to_datetime
			params[:chart_filter][:upper_range] =  Time.parse(params[:chart_filter][:upper_range]).to_datetime
	    end
	    if  params[:chart_filter][:reference_date]
	      	params[:chart_filter][:reference_date] =  Time.parse(params[:chart_filter][:reference_date]).to_datetime
	    end
	    params[:chart_filter][:user_id] = current_user.id
		@chart_filter = ChartFilter::create_chart_filter(params[:chart_filter])

	    if @chart_filter
	      render :json => @chart_filter
	    else
	      Rails.logger.debug @chart_filter.errors.full_messages.join("\n")
	      render json: {}, status: 401
	    end		
	end

	def update
		if  params[:chart_filter][:lower_range] &&  params[:chart_filter][:upper_range] 
	      params[:chart_filter][:lower_range] =  Time.parse(params[:chart_filter][:lower_range]).to_datetime
	      params[:chart_filter][:upper_range] =  Time.parse(params[:chart_filter][:upper_range]).to_datetime
	    end
	    if  params[:chart_filter][:reference_date]
	      params[:chart_filter][:reference_date] =  Time.parse(params[:chart_filter][:reference_date]).to_datetime
	    end
		
		@chart_filter = ChartFilter.find params[:id]
        if @chart_filter.update_attributes(params[:chart_filter]) 
            render json: @chart_filter
        else
            render json: @chart_filter.errors.full_messages.join("\n")
        end
	end

	def destroy
        @chart_filter = ChartFilter.find(params[:id])
        @chart_filter.destroy 

        respond_to do |format|
          format.html { redirect_to root_url }
          format.json { head :no_content }
        end
	end
end
