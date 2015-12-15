class CommentsController < AuthController
    before_filter :auth_only! 	
	def index
		@comments = Comment.all
		render :json => @comments
	end
	
	def new
		@comment = Comment.new
		render :json => @comment
	end

	def create
    	@comment = Comment.new(params[:comment])
    	if(@comment.status.nil?) 
    		@comment.status = 0
    	end
      	if @comment.save
      		chart_users = @comment.chart.subscribers
      		recepients = @comment.chart.alert_emails

      		chart_users.each do |u|
      			recepients << u.email
      		end
          chart = @comment.chart
          url = "#{request.protocol}#{request.host_with_port}/#/verticals/#{chart.vertical.id}/#{chart.dashboard.id}/charts"
      		UserMailer.comment_notification(@comment, current_user, recepients, url).deliver
      		render :json => @comment
      	else
			Rails.logger.debug @comment.errors.full_messages.join("\n")
        	render :json => {
        		'message' => 'unable to save'
        	}
      	end
  	end

	def show
		@comment = Comment.find(params[:id])
		render :json => @comment
	end	

	def edit
	end

	def update
		@comment = Comment.find(params[:id])
      	if @comment.update_attributes(params[:comment])
      		render :json => @comment
      	else
			Rails.logger.debug @comment.errors.full_messages.join("\n")
        	render :json => {
        		'message' => 'unable to save'
        	}
      	end
	end


end
