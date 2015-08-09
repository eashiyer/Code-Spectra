class DashboardFiltersController < ApplicationController
  # GET /dashboard_filters
  # GET /dashboard_filters.json
  def index
    if(params[:ids])
      @dashboard_filters = DashboardFilter.where('id in (?) && (is_global = ? || user_id = ?)', params[:ids], true, current_user.id)
    else
      @dashboard_filters = DashboardFilter.all
    end
    
    render :json => @dashboard_filters
  end

  # GET /dashboard_filters/1
  # GET /dashboard_filters/1.json
  def show
    @dashboard_filter = DashboardFilter.find(params[:id])
    render :json => @dashboard_filter
  end

  # GET /dashboard_filters/new
  # GET /dashboard_filters/new.json
  def new
    @dashboard_filter = DashboardFilter.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @dashboard_filter }
    end
  end

  # GET /dashboard_filters/1/edit
  def edit
    @dashboard_filter = DashboardFilter.find(params[:id])
  end

  # POST /dashboard_filters
  # POST /dashboard_filters.json
  def create
    if  params[:dashboard_filter][:lower_range] &&  params[:dashboard_filter][:upper_range] 
      params[:dashboard_filter][:lower_range] =  Time.parse(params[:dashboard_filter][:lower_range]).to_datetime
      params[:dashboard_filter][:upper_range] =  Time.parse(params[:dashboard_filter][:upper_range]).to_datetime
    end
    if  params[:dashboard_filter][:reference_date]
      params[:dashboard_filter][:reference_date] =  Time.parse(params[:dashboard_filter][:reference_date]).to_datetime
    end
    
    @dashboard_filter = DashboardFilter.new(params[:dashboard_filter])

    respond_to do |format|
      if @dashboard_filter.save
        format.html { redirect_to @dashboard_filter, notice: 'Dashboard filter was successfully created.' }
        format.json { render json: @dashboard_filter, status: :created, location: @dashboard_filter }
      else
        format.html { render action: "new" }
        format.json { render json: @dashboard_filter.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /dashboard_filters/1
  # PUT /dashboard_filters/1.json
  def update
    @dashboard_filter = DashboardFilter.find(params[:id])

    if  params[:dashboard_filter][:lower_range] &&  params[:dashboard_filter][:upper_range] 
      params[:dashboard_filter][:lower_range] =  Time.parse(params[:dashboard_filter][:lower_range]).to_datetime
      params[:dashboard_filter][:upper_range] =  Time.parse(params[:dashboard_filter][:upper_range]).to_datetime
    end
    if  params[:dashboard_filter][:reference_date]
      params[:dashboard_filter][:reference_date] =  Time.parse(params[:dashboard_filter][:reference_date]).to_datetime
    end
    respond_to do |format|
      if @dashboard_filter.update_attributes(params[:dashboard_filter])
        format.html { redirect_to @dashboard_filter, notice: 'Dashboard filter was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @dashboard_filter.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /dashboard_filters/1
  # DELETE /dashboard_filters/1.json
  def destroy
    @dashboard_filter = DashboardFilter.find(params[:id])
    @dashboard_filter.destroy

    respond_to do |format|
      format.html { redirect_to dashboard_filters_url }
      format.json { head :no_content }
    end
  end
end
