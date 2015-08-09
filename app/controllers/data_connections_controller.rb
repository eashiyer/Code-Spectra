class DataConnectionsController < AuthController
    before_filter :auth_only! 	
	def index
		if(params[:connection_type]) 
			@data_connections = DataConnection.where(:connection_type => params[:connection_type], 
				:account_id => current_user.account.id)
		else
			@data_connections = current_user.account.data_connections
		end

		render :json => @data_connections, :each_serializer  => DataConnectionSerializer
	end

	def create
		params[:data_connection].delete(:connection_status) if params[:data_connection].has_key?(:connection_status)
	    @data_connection = DataConnection.new(params[:data_connection])
	  	if @data_connection.save
	  		render :json => @data_connection
	  	else
			Rails.logger.debug @data_connection.errors.full_messages.join("\n")
	    	render :json => {
	    		'message' => 'unable to save'
	    	}
	  	end
  	end

  	def destroy
  		@data_connection = DataConnection.find(params[:id])
		if @data_connection.destroy
			respond_to do |format|
	          format.json { head :no_content }
	        end
		else
			Rails.logger.debug @data_connection.errors.full_messages.join("\n")
	  		render :json => {
	   			'message' => 'unable to delete'
	   		}
		end
  	end

  	def test_connection
  		@data_connection=DataConnection.find(params[:id])
  		connected=@data_connection.check_connection
  		render :json => connected
  	end

end