class ChartsController < AuthController
    before_filter :auth_only! , :except => 'chart_data'
    
    def index
        if params[:ids]
            @charts = Chart.find_all_by_id_and_is_hidden(params[:ids], false, :order => [:display_rank, :created_at])
        elsif params[:dashboard_id]
            @charts = Chart.find_all_by_dashboard_id_and_is_hidden(params[:dashboard_id], false, :order => [:display_rank, :created_at])
        else
            @charts = Chart.all(:limit => 2)
        end
        @charts.map do |c|
            c.apply_user_preferences(current_user)
        end
        render :json => @charts
    end

    def show
        @chart = Chart.find params[:id]
        @chart.apply_user_preferences(current_user)
        render :json => @chart
    end

    def create
        params[:chart].delete("highlight_rule_id")
        @chart = Chart.new 
        if @chart.create_chart(params[:chart])
            render json: @chart
        else
            logger.debug @chart.errors.full_messages.join("\n")
            render json: @chart.errors.full_messages.join("\n")
        end
    end

    def update
        params[:chart].delete("highlight_rule_id")
        @chart = Chart.find params[:id]
        if @chart.update_chart(params[:chart], current_user) 
            @chart.apply_user_preferences(current_user)
            render json: @chart
        else
            logger.debug @chart.errors.full_messages.join("\n")
            render json: @chart.errors.full_messages.join("\n")
        end
    end

    def update_excluded_rows
        chart=Chart.find(params[:id])
        chart.update_attribute('excluded_rows',params[:excluded_rows])
        render json: {}
    end

    def destroy
        @chart = Chart.find(params[:id])
        @chart.destroy 

        respond_to do |format|
          format.html { redirect_to root_url }
          format.json { head :no_content }
        end
    end

    def download_csv
        chart = Chart.find(params[:id])        
        csv_data = chart.chart_data(JSON.parse(params[:filters]),params[:is_underlying_data],params[:option_value])
        if(csv_data)
            keys = csv_data[0].keys
               file = "public/chart_data_#{params[:id]}.csv"
                 File.open(file, "w") do |csv|
                  csv << keys * ","
                  csv << "\n"
                   csv_data.each do |hash|
                    hash.each do |key, val|
                        csv << val ? val : " "
                        csv << ','                    
                    end  
                    csv << "\n"    
                 end
               end
             send_file(file)
        end
    end

    def chart_data
        chart = Chart.find(params[:id])
        filters = params["filters"] || [].to_json
        data = chart.chart_data(JSON::parse(filters))
        render :json => data
    end

    def getPreviewData
        data_source = DataSource.find(params[:id])
        sort_key = params[:sort_key] || nil
        sort_order = params[:sort_order] || nil
        dimensions_obj = JSON.parse(params[:dimensions_obj])
        measures_obj = JSON.parse(params[:measures_obj])
        limit = params[:limit] ? params[:limit] : nil
        if data_source
            sort_key = params[:sort_key] || nil
            sort_order = params[:sort_order] || nil
            data = data_source.get_preview_data(params[:chart_type], dimensions_obj, measures_obj, sort_key, sort_order, limit)
            render :json => data
        else
            render :json => {}
        end
    end
end
