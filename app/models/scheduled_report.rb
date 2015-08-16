class ScheduledReport < ActiveRecord::Base
  attr_accessible :dashboard_id, :time, :user_id, :is_scheduled, :last_sent_at, :emails, :days

  belongs_to :user

  validates_uniqueness_of :user_id, :scope => :dashboard_id

  def create_and_send_report(user_id)
  	user = User.find(user_id)
  	secret_token = user.authentication_token
  	reports = ScheduledReport.find_all_by_user_id_and_is_scheduled(user_id,true)

	headless = Headless.new(:dimensions => '1600x900x24')
	headless.start

	begin
	browser = Watir::Browser.new
		browser.goto "#{Rails.application.config.cibi_url}?backend_secret_token=#{secret_token}"
		reports.each do |report|
			next if report_already_sent(report)
			dashboard_id = report.dashboard_id
			dashboard = Dashboard.find(dashboard_id)
			vertical_id = dashboard.vertical_id
			browser.goto "#{Rails.application.config.cibi_url}/#/verticals/#{vertical_id}/#{dashboard_id}/charts"
			sleep 10
			browser.execute_script("$('body').css('margin-left','-62px')")
			browser.execute_script("$('body').css('margin-top','-100px')")
			browser.execute_script("$('#top-nav-bar').hide()")
			browser.execute_script("$('#vertical_affix').hide()")
			browser.execute_script("$('#vertical-bar').hide()")
			browser.execute_script("$('#dashboard_menu').hide()")
						
			# Save screenshot to file
			current_time = Time.now.strftime('%m%d%Y%H%M')
			filename = "#{dashboard.title}(#{current_time}).png"
			file_path = "#{Rails.root}/public/dashboard_reports/#{filename}"
			browser.screenshot.save file_path
			UserMailer.send_dashboard_report(user, filename, report.emails).deliver
			report.update_attribute('last_sent_at', Time.now)
			File.delete(file_path) if File.exist?(file_path)
		end
	ensure
		browser.close
		headless.destroy
	end
  end

  def report_already_sent(report)
  	if report.last_sent_at.nil?
  		return false 
  	elsif  Time.now.hour == report.time.to_i
  		if (report.last_sent_at + report.days).day == Time.now.day
  			return false
  		else
  			return true
  		end
  	end
  	return true
  end

  def send_chart_report(chart_ids, emails,user_id)
  	User.current_user = User.find(user_id)
  	chart_ids.each do |ch|
  		chart = Chart.find(ch)
  		# filters = chart.chart_filters
  		cds = chart.charts_data_sources
      	csv_data = cds[0].chart_data(nil,nil,nil,nil,nil)
    	# csv_data = chart.chart_data(filters)
 		if(csv_data)
 			keys = csv_data['result'][0].keys
	           	file = "public/dashboard_reports/chart_data_#{ch}.csv"
	             File.open(file, "w") do |csv|
	              csv << keys * ","
	              csv << "\n"
	               csv_data['result'].each do |hash|
	                hash.each do |key, val|
	                    csv << val ? val : " "
	                    csv << ','                    
	                end  
	                csv << "\n"    
	            end
	        end
	        filename = "chart_data_#{ch}.csv"
            file_path = "#{Rails.root}/public/dashboard_reports/#{filename}"
            UserMailer.send_dashboard_report(User.current_user, filename, emails).deliver
			File.delete(file_path) if File.exist?(file_path)
 		end	
  	end

  end
end
