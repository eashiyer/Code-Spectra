class SpreeDataSourceWorker
	include Sidekiq::Worker
	sidekiq_options :retry => 5

	def perform(id)
 		begin
 			sds = SpreeDataSource.find(id)
 			now = Time.now
 			if (!sds.last_run_at) || (Time.now - sds.last_run_at > sds.frequency_of_import.minutes)
					sds.fetch_spree_sales			
			end
		rescue Exception => e
		  	Rails.logger.error e.to_s
			puts e.to_s
		end
	end
end