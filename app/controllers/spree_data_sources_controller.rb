class SpreeDataSourcesController < AuthController
    before_filter :auth_only! 
    	
	def index
		@spree_data_sources = current_user.account.data_sources.map { |ds| ds.spree_data_source }
		render :json => @spree_data_sources
	end

	def show
		@spree_data_source = nil
		if (params[:data_source_id]) 
			ds = DataSource.find(params[:data_source_id])
			if ds.account_id == current_user.account_id
				@spree_data_source = ds.spree_data_source
			end
		else
			sds = SpreeDataSource.find(params[:id])
			ds = sds.data_source
			if ds.account_id == current_user.account_id
			 	@spree_data_source = sds
			end
		end		
		if @spree_data_source
			render :json => @spree_data_source 
		else
	        render json: {:error => "You are not authorized to access this data source!"}, status: 401    
		end
	end

	def create
	    @spree_data_source = SpreeDataSource.new(params[:spree_data_source])
	  	if @spree_data_source.save
	  		@spree_data_source.create_table
	  		render :json => @spree_data_source
	  	else
			Rails.logger.debug @spree_data_source.errors.full_messages.join("\n")
	    	render :json => {
	    		'message' => @spree_data_source.errors.full_messages[0]
	    	}
	  	end
	end

	def update
		@spree_data_source = SpreeDataSource.find(params[:id])
    
	    qds_params = params[:spree_data_source]
	    if @spree_data_source.update_attributes(qds_params)
	  		render :json => @spree_data_source
	  	else
	    	Rails.logger.debug @spree_data_source.errors.full_messages.join("\n")
	    	render :json => {
	    		'message' => @spree_data_source.errors.full_messages[0]
	    	}
	  	end
	end

end


