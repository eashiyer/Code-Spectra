class ApplicationController < ActionController::Base
  before_filter :set_mailer_host
  protect_from_forgery
  

  def set_mailer_host
    ActionMailer::Base.default_url_options[:host] = request.host_with_port
  end

  before_filter :set_current_user

  def set_current_user
    User.current_user = current_user
  end

  def check_authorization
    begin
      unless current_user
        render json: {}, status: 401  
      end

      # if current_user.is_admin?
      #   return true
      # end
      params = self.params
      action = params[:action]
      permissible_type = params[:controller].singularize.capitalize

      #id_param = p.keys.select {|k| k.match(/id/)}[0]
      
      if params[:id]
        permissible_ids = [params[:id]]
      elsif params[:ids]
        permissible_ids = params[:ids]
      end

      # FIND IF USER HAS AUTHORIZATION FOR THIS RESOURCE & ACTION
      has_authorization = current_user.has_authorization?(permissible_type, permissible_ids, action)
      if has_authorization
        return true
      else
        render json: {}, status: 401
      end
    rescue Exception => e
      Rails.logger.debug "ApplicationController::check_authorization #{e}"
      Rails.logger.error e.backtrace.join("\n")
      render json: {}, status: 401
    end
  end

  def can_create_dashboard
    begin
      if current_user.is_admin?
        return true
      end

      vertical_id = params[:dashboard][:vertical_id]
      
      has_authorization = current_user.has_authorization?("Vertical", [vertical_id], "update")
      if has_authorization
        return true
      else
        render json: {}, status: 401
      end
    rescue Exception => e
      Rails.logger.debug "ApplicationController::can_create_dashboard #{e}"
      Rails.logger.error e.backtrace.join("\n")
      render json: {}, status: 401
    end
  end


  def can_update_auth_roles(permission)
    begin
      if current_user.account_id != permission.permissible.account.id
        return false
      end

      if current_user.account_id != permission.user.account_id
        return false
      end

      if current_user.is_admin?
        return true
      end

      has_authorization = current_user.has_authorization?(permission.permissible_type, [permission.permissible_id], "destroy")
      if has_authorization
        return true
      else
        return false
      end
    rescue Exception => e
      Rails.logger.debug "ApplicationController::can_update_auth_roles #{e}"
      Rails.logger.error e.backtrace.join("\n")
      return false
    end
  end
end
