class HighlightRulesController < AuthController
	
	def index
		render :json => {}
	end

	def show
        @highlight_rule = HighlightRule.find params[:id]
        render :json => @highlight_rule
	end

	def create
		@highlightRule = HighlightRule.new params[:highlight_rule]
		if @highlightRule.save
			render :json => @highlightRule
		else
			logger.debug @highlightRule
		end
	end

	def update
		@highlightRule = HighlightRule.find params[:id]
        if @highlightRule.update_attributes(params[:highlight_rule]) 
            render json: @highlightRule
        else
            render json: @highlightRule.errors.full_messages.join("\n")
        end
	end
end