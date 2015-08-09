class DashboardsController < AuthController
	require 'RMagick'
	before_filter :auth_only! 
	before_filter :check_authorization, :except => [:index, :create]
	before_filter :can_create_dashboard, :only => :create
	
	def index	
		if(params[:ids])
			current_vertical= Dashboard.find(params[:ids][0]).vertical
			is_admin_for_vertical=current_user.permissions.find_all_by_permissible_type_and_permissible_id("Vertical",current_vertical.id)
			if current_user.is_admin || is_admin_for_vertical.length>0
				@dashboards = Dashboard.find_all_by_id(params[:ids])
			else
				permissible_dashboards=current_user.permissions.find_all_by_permissible_type("Dashboard")
				permissible_dashboard_ids=[]
				permissible_dashboards.each do |p|
					if params[:ids].include?p.permissible_id.to_s
						permissible_dashboard_ids << p.permissible_id
					end
				end
				
				@dashboards=Dashboard.find_all_by_id(permissible_dashboard_ids)
			end			
		else
			@dashboards = Dashboard.all
		end
		render :json => @dashboards
	end

	def show
		@dashboard = Dashboard.find(params[:id])
		render :json => @dashboard
	end

	def create
		@dashboard = Dashboard.new params[:dashboard]
		if @dashboard.save
			render :json => @dashboard
		else
			logger.debug @dashboard
		end
	end

    def destroy
        @dashboard = Dashboard.find params[:id]
        @dashboard.destroy

        respond_to do |format|
          format.json { head :no_content }
        end
    end

	def update
		@dashboard = Dashboard.find params[:id]
  		if @dashboard.update_attributes params[:dashboard]
  			render :json => @dashboard
  		else
    		Rails.logger.debug @dashboard.errors.full_messages.join("\n")
    		render :json => {
    			'message' => 'unable to save'
    		}
  		end
	end 

	def download_svg   
		dashboard_title = Dashboard.find(params[:id]).title
		@svg = params[:svg].gsub("data:image/jpeg;base64,", "")
		jpeg_file = Rails.root.join('public',"#{dashboard_title}.jpeg")
		File.open(jpeg_file, 'wb') do|f|
		  f.write(Base64.decode64(@svg))
		end
		file = File.open(jpeg_file)
		save_path = Rails.root.join('public',"#{dashboard_title}.pdf")
		img  = Magick::Image.read(file).first;
		img.write(save_path){self.density = "100x100"};
		File.delete(file);
		render :json => {:filename => "#{dashboard_title}.pdf"}
		#send_file('document.pdf')
	end

	def delete_temp_pdf
		file = Rails.root.join('public',"#{params[:filename]}")
		File.delete(file);
		render :json => {:message => 'success'}
	end
end
