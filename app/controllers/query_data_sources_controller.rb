class QueryDataSourcesController < AuthController
    before_filter :auth_only! 
    	
	def index
		if(params[:data_source_id]) 
			@query_data_sources = QueryDataSource.find_all_by_data_source_id(params[:data_source_id])
		else
			@query_data_sources = QueryDataSource.all
		end
		render :json => @query_data_sources
	end

	def show
		if(params[:data_source_id]) 
			@query_data_source = QueryDataSource.find_by_data_source_id(params[:data_source_id])
		else
			@query_data_source = QueryDataSource.find(params[:id])
		end
		render :json => @query_data_source
	end

	def create
		params[:query_data_source][:unsuccessfull_count] = 0
	    @query_data_source = QueryDataSource.new(params[:query_data_source])
	  	if @query_data_source.save
	  		render :json => @query_data_source
	  	else
			Rails.logger.debug @query_data_source.errors.full_messages.join("\n")
	    	render :json => {
	    		'message' => 'unable to save'
	    	}
	  	end
	end

	def update
		@query_data_source = QueryDataSource.find(params[:id])
    
	    qds_params = params[:query_data_source]
	    if @query_data_source.update_attributes(qds_params)
	  		render :json => @query_data_source
	  	else
	    	Rails.logger.debug @query_data_source.errors.full_messages.join("\n")
	    	render :json => {
	    		'message' => 'unable to save'
	    	}
	  	end
	end

end


