class SpreeDataSourceSalesWorker
	include Sidekiq::Worker
	sidekiq_options :retry => 5

	def perform(id, order_number, order_token, data_content_id)
	    begin
	        sds = SpreeDataSource.find(id)
	        sds.fetch_and_save_spree_sales(order_number, order_token, data_content_id)
	    rescue Exception => e
	        Rails.logger.error e.to_s
	        puts e.to_s
	    end
	end
end