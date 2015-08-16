class DataImporterWorker
	include Sidekiq::Worker
	# sidekiq_options :retry => 5

	def perform
		begin
			next_run_at = Time.now + 30.minutes
			DataImporterWorker.perform_at(next_run_at)
			qds = QueryDataSource.find_all_by_enabled(true)
			qds.each do |q|
				QueryDataSourceWorker.perform_async(q.id)
			end

			#spree data source importer
		 	spree_data_sources = SpreeDataSource.find_all_by_enabled(true)
		 	spree_data_sources.each do |sds|
				SpreeDataSourceWorker.perform_async(sds.id)
			end
		rescue Exception => e
		  	Rails.logger.error e.to_s
			puts e.to_s
		end
	end
end