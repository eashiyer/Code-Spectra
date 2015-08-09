class PermissionsController < AuthController
  before_filter :auth_only!

  def index    
  	if params[:user_id]
  		@permissions = Permission.find_all_by_user_id(params[:user_id])
  	elsif params[:vertical_id]
  		@permissions = Permission.find_all_by_permissible_type_and_permissible_id("Vertical", params[:vertical_id])
      dashboards=Vertical.find(params[:vertical_id]).dashboards
      dashboards.each do |d|
        @permissions.push *Permission.find_all_by_permissible_type_and_permissible_id("Dashboard", d.id)
      end
  	elsif params[:dashboard_id]
      @permissions = Permission.find_all_by_permissible_type_and_permissible_id("Dashboard", params[:dashboard_id])
    else
      @permissions = []
  	end
  	render :json => @permissions
  end

  def show
  	id = params[:id]
  	@permission = Permission.find(id)
  	render :json => @permission
  end

  def update
    @permission = Permission.find params[:id]
    has_authorization = can_update_auth_roles(@permission)
    unless has_authorization
      render json: {}, status: 401
      return
    end
    
    if @permission.update_attributes params[:permission]
      render :json => @permission
    else
      Rails.logger.debug @permission.errors.full_messages.join("\n")
      render json: {}, status: 401
    end
  end    

  def create
    @permission = Permission.new(params[:permission])

    has_authorization = can_update_auth_roles(@permission)
    unless has_authorization
      render json: {}, status: 401
      return
    end

    if @permission.save
      render :json => @permission
    else
      Rails.logger.debug @permission.errors.full_messages.join("\n")
      render json: {}, status: 401
    end
  end  

  def destroy
    @permission = Permission.find params[:id]

    has_authorization = can_update_auth_roles(@permission)
    unless has_authorization
      return
    end

    @permission.destroy

    respond_to do |format|
      format.html { redirect_to root_url }
      format.json { head :no_content }
    end
  end


end
