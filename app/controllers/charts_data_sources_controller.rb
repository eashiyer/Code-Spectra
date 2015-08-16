class ChartsDataSourcesController < AuthController
    before_filter :auth_only! 
    	
	def index
		if(params[:ids])
			@cds = ChartsDataSource.find_all_by_id(params[:ids])
		else
			@cds = ChartsDataSource.all
		end
		render :json => @cds
	end

	def show
		@cds = ChartsDataSource.find(params[:id])
		render :json => @cds
	end	

    def update
        @cds = ChartsDataSource.find params[:id]
     #    if(!@cds) 
	    #     respond_to do |format|
	    #       format.html { redirect_to applications_url }
	    #       format.json { head :no_content }
	    #     end
	    # else
	  		if @cds.update_attributes params[:charts_data_source]
	  			render :json => @cds
	  		else
	    		Rails.logger.debug @cds.errors.full_messages.join("\n")
	    		render :json => {
	    			'message' => 'unable to save'
	    		}
	  		end

        # end
    end

	def destroy
		@cds = ChartsDataSource.find(params[:id])
		@cds.destroy
        respond_to do |format|
          format.html { redirect_to applications_url }
          format.json { head :no_content }
        end
	end

	def chartData	
		if params[:preview]	
			@cds = ChartsDataSource.new()
			@cds.generate_preview_objects(params[:preview_data],params[:data_source_id],params[:chart_type])
		else
			@cds = ChartsDataSource.find(params[:id])
		end
		if @cds
		    excluded_data_sources = current_user.get_excluded_data_sources
		    if excluded_data_sources.include?(@cds.data_source)
		    	return render :json => 
		    		{message: "You do not have permission to view one of the underlying data tables. Please contact your system administrator for more information!"}, 
		    		:status => 422
			end

			filters = params[:filters] || nil
			limit = params[:limit] || params[:length] || nil
			offset = params[:offset] || params[:start] || nil
			sort_key = params[:sort_key] || nil
			sort_order = params[:sort_order] || nil
			begin
				data = @cds.chart_data(filters, limit, offset, sort_key, sort_order)
			rescue => e 
				return render :json => {message: e.message}, :status => 422
			end
			render :json => data
		else
			render :json => {}
		end

	end

	def rawData
		@cds = ChartsDataSource.find(params[:id])
		if @cds
			filters = params[:filters] || nil
			limit = params[:limit] || nil
			offset = params[:offset] || nil
			sort_key = params[:sort_key] || nil
			sort_order = params[:sort_order] || nil
			fields = params[:fields] || nil
			is_underlying_data= params[:is_underlying_data] || nil
			option_value=params[:option_value] || nil
			data = @cds.raw_data(filters, limit, offset, sort_key, sort_order, fields, is_underlying_data, option_value)
			render :json => data
		else
			render :json => {}
		end

	end

	def uniqueKeys 
		field = params[:field]

		formatAs = params[:formatAs] || ''
		cds = ChartsDataSource.find(params[:id])
		data_source_id = cds.data_source_id
		arr = []
	 	if cds.data_source.fields.include?(field)
			table_name = "#{data_source_id}_contents"
			cibids = Cibids.new
			keys = cibids.get_unique_keys(table_name, field, formatAs, cds.data_source.updated_at)			
			if keys
				keys.each do |k|
					arr << k[field]
				end
			end		
		end
		render :json => {'keys' => arr}
    end
end
