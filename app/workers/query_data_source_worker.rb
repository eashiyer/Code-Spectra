class QueryDataSourceWorker
	include Sidekiq::Worker
	sidekiq_options :retry => 5

	def perform(id)
		begin
			qds = QueryDataSource.find(id)
			now = Time.now
			# Execute the query if its time to execute or if this is the first time query will be executed
			if (!qds.last_run_at) || (Time.now - qds.last_run_at > qds.frequency.minutes)
				qds.execute	
			end
		rescue Exception => e
		  	Rails.logger.error e.to_s
			puts e.to_s
		end
	end
end
