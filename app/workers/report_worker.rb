class ReportWorker
	include Sidekiq::Worker
	sidekiq_options :retry => 5

	def perform
		begin
			next_run_at = Time.now + 30.minutes
			ReportWorker.perform_at(next_run_at)

			#schedule report worker
			# user_ids = ScheduledReport.select(:user_id).map(&:user_id).uniq
			# user_ids.each do |user_id|			 	
				ScheduleReportWorker.perform_async
			# end

		rescue Exception => e
		  	Rails.logger.error e.to_s
			puts e.to_s
		end
	end
end