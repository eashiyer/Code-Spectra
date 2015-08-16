class UserColorPreferencesController < ApplicationController
	def index
		@color_preferences = [current_user.user_color_preference]
		render :json => @color_preferences
	end

	def show
		@color_preferences = UserColorPreference.find_by_user_id(current_user.id) #user_color_preference#
        unless @color_preferences
            @color_preferences = UserColorPreference.new
        end
		render :json => @color_preferences
	end

	def update
        @color_preference_params = params[:user_color_preference]
        @color_preferences = UserColorPreference.find_by_user_id(@color_preference_params["user_id"])

        unless @color_preferences
            @color_preferences = UserColorPreference.new(params[:user_color_preference])
            if @color_preferences.save()
                render json: @color_preferences
            else
                logger.debug @color_preferences.errors.full_messages.join("\n")
                render json:  {:message => "Unable to save user's color preferences"}, status: 500
            end            
        else
            if @color_preferences.user != current_user
                render json: {}, status: 401
                return
            end

            if @color_preferences.update_attributes!(params[:user_color_preference])             
                render json: @color_preferences
            else
                logger.debug @color_preferences.errors.full_messages.join("\n")
                render json: {:message => "Unable to save user's color preferences"}, status: 500
            end 
        end

        

	
	end

	def create
        @color_preferences = UserColorPreference.new(params[:user_color_preference])
        if @color_preferences.save()
            render json: @color_preferences
        else
            logger.debug @color_preferences.errors.full_messages.join("\n")
            render json:  {:message => "Unable to save user's color preferences"}, status: 500
        end
	end	
end
