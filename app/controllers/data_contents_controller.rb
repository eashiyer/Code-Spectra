class DataContentsController < AuthController
	before_filter :auth_only! 
	respond_to :json
	
	def index
		if(params[:ids])
			@data_content = DataContent.find(params[:ids], :select => [:id, :filename, :created_at, :size, :format])
		else
			@data_content = DataContent.all(:select => [:id, :filename, :created_at, :size, :format])
		end
		
		render :json => @data_content
	end

	def show
		@data_content = DataContent.find(params[:id], :select => [:id, :filename, :created_at, :size, :format])
		render :json => @data_content
	end

    def destroy
        @dc = DataContent.find params[:id]
        respond_to do |format|
        	if @dc.destroy_and_update
				format.json { head :no_content, status: :ok }
        	else
        		format.json { head :no_content, status: :error }
        	end

        end
    end
end
