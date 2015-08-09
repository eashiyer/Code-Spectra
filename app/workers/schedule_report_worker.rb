class ScheduleReportWorker
	include Sidekiq::Worker
	sidekiq_options :retry => 5

	def perform
 		begin
 			user_ids = ScheduledReport.select(:user_id).map(&:user_id).uniq
			user_ids.each do |user_id|			
	 			scheduled_report = ScheduledReport.new
	 			scheduled_report.create_and_send_report(user_id)
	 		end	 		
		rescue Exception => e
		  	Rails.logger.error e.to_s
			puts e.to_s
		end
	end
end