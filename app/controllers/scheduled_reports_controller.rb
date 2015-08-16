class ScheduledReportsController < ApplicationController
  # GET /scheduled_reports
  # GET /scheduled_reports.json
  def index
    if params[:dashboard_id]
      @scheduled_reports = ScheduledReport.find_by_user_id_and_dashboard_id(current_user.id,params[:dashboard_id])
    end

    if @scheduled_reports
      render :json => {'scheduled_reports' => [@scheduled_reports]}
    else
      render json:  {}
    end
  end

  # GET /scheduled_reports/1
  # GET /scheduled_reports/1.json
  def show
    @scheduled_report = ScheduledReport.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @scheduled_report }
    end
  end

  # GET /scheduled_reports/new
  # GET /scheduled_reports/new.json
  def new
    @scheduled_report = ScheduledReport.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @scheduled_report }
    end
  end

  # GET /scheduled_reports/1/edit
  def edit
    @scheduled_report = ScheduledReport.find(params[:id])
  end

  # POST /scheduled_reports
  # POST /scheduled_reports.json
  def create
    @scheduled_report = ScheduledReport.find_or_initialize_by_user_id_and_dashboard_id(params[:scheduled_report][:user_id], params[:scheduled_report][:dashboard_id])
    @scheduled_report.is_scheduled = params[:scheduled_report][:is_scheduled]
    @scheduled_report.time = params[:scheduled_report][:time]
    @scheduled_report.days = params[:scheduled_report][:days]
    @scheduled_report.emails = params[:scheduled_report][:emails]

    respond_to do |format|
      if @scheduled_report.save
        format.html { redirect_to @scheduled_report, notice: 'Scheduled report was successfully created.' }
        format.json { render json: @scheduled_report, status: :created, location: @scheduled_report }
      else
        format.html { render action: "new" }
        format.json { render json: @scheduled_report.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /scheduled_reports/1
  # PUT /scheduled_reports/1.json
  def update
    @scheduled_report = ScheduledReport.find(params[:id])

    respond_to do |format|
      if @scheduled_report.update_attributes(params[:scheduled_report])
        format.html { redirect_to @scheduled_report, notice: 'Scheduled report was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @scheduled_report.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /scheduled_reports/1
  # DELETE /scheduled_reports/1.json
  def destroy
    @scheduled_report = ScheduledReport.find(params[:id])
    @scheduled_report.destroy

    respond_to do |format|
      format.html { redirect_to scheduled_reports_url }
      format.json { head :no_content }
    end
  end
end
