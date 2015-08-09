class Cibids
	URL = "localhost:9000"
	BATCH_SIZE = 15
	UNIQUE_KEYS_TIMEOUT = 1800  # 30 Minutes
	TOTALS_KEY_TIMEOUT = 1800  # 30 Minutes
	GET_DATA_KEY_TIMEOUT = 43200  # 30 Minutes
	API_KEY = "6f01e39b1411df5dc3a12c58f85c4e09"
	
	# Calls the create table method of Storage Service API

	# curl  --header ":text/plain" 
	#  --request POST 
	#  --data '"tableName": "Test",
	#  "config": ["col1"], 
	#  "data":[
	#  	{"fieldName":"col1", "fieldType":"varchar(200)"}, 	
	#  	{"fieldName":"col2", "fieldType":"decimal(20,10)"}
	#  ]}' http://localhost:9000/createTable

	def create_table(table_name, fields, config)
		curl = nil
		begin

			fields.each do |field|
				unless field["fieldType"]
					field["fieldType"] = "varchar(200)"
				end
			end
			data = {
				"tableName" => table_name,
				"data" => fields,
				"config" => config,
				"api_key" => "#{Cibids::API_KEY}"
			}.to_json

			url =  "#{Cibids::URL}/createTable"
			curl = Curl::Easy.http_post(url, data) do |c|
				c.headers['Content-type'] = 'text/plain'
			end	
			if curl.response_code != 200
				puts "Curl Returned an error response code. #{curl.body_str}"
				Rails.logger.error "Curl Returned an error response code"
				curl.close unless curl.nil?
				return false
			end
			return_str = curl.body_str
			curl.close unless curl.nil?
			return_str
		rescue Exception => e
			curl.close unless curl.nil?
			puts "Curl Failed #{e.message}"
			Rails.logger.error "Curl Failed #{e.message}"
			return false
		end
	end

	# curl  
	# --header "Content-type:text/plain"  
	# --request POST  
	# --data '{
	# "tableName": "Test", 
	# "data":[
	# 	{"type":"String", "key":"col1", "value":"Value1_Test"}, 
	# 	{"type":"number", "key":"col2", "value":"2343.3423"}
	# ]}' 
	# http://localhost:9000/addData

	def add_data(table_name, table_data, ds_id, unique_keys) 
		url =  "#{Cibids::URL}/addData"
		failed_curls = [], succeeded_curls = []	
 		$redis.set("rec_count_#{ds_id}", 0)
		begin
			set_size = table_data.length / 10
			set_size = (set_size < 1 ) ? 1 : set_size

			sets = table_data.each_slice(set_size).to_a
			rec_count = 0
			sets.each do |set|
				# m_curl = Curl::Multi.new
				chunks = set.each_slice(Cibids::BATCH_SIZE).to_a
				chunks.each do |data_chunk|
					
					data = {
						"tableName" => table_name,
						"data" => data_chunk,
						"uniqueKeys" => unique_keys,
						"api_key" => "#{Cibids::API_KEY}"
					}.to_json
					
					curl = Curl::Easy.http_post(url, data) do |c|
						c.headers['Content-type'] = 'text/plain'
						c.timeout = 300
					end

					if curl.response_code != 200
						msg=curl.body_str
						curl.close unless curl.nil?
						puts "Curl Returned an error response code. #{msg}"
						Rails.logger.error "Curl Returned an error response code"
						return msg
					end
					result = curl.body_str

					curl.close unless curl.nil?								
					# curl.http("post")

					# if curl.response_code != 200
					# 	# m_curl.close unless m_curl.nil?
					# 	puts "Curl Returned an error response code. #{curl.body_str}"
					# 	Rails.logger.error "Curl Returned an error response code"
					# 	return false
					# end
					# m_curl.add(curl)
				end
				rec_count += 1
				puts set_size
					puts rec_count
				upload_percent = ((set_size*rec_count)/(set_size*10).to_f) *100
				$redis.set("rec_count_#{ds_id}", upload_percent.to_i)
					puts '======================================================='
					puts upload_percent.to_i
					puts '======================================================='
				# while not m_curl.requests.empty?
	  	# 			m_curl.perform
				# end				
			end
			Cibids::cleanup 
			#$redis.set("rec_count_#{ds_id}", 0)
			true
		rescue Exception => e
			# m_curl.close unless m_curl.nil?
			Cibids::cleanup
			puts "Curl Failed #{e.message}"
			puts "#{e.backtrace}"
			Rails.logger.error "Curl Failed #{e.message}"
			return false
		end
	end

 	# {
 	# "tableName":"testq", 
 	# "factMap":[
 	# 	{"fieldName":"uname","formatAs":"null"},{"fieldName":"usalary","formatAs":"null"}
 	# ], 
 	# "sortMap":[
 	# 	{"fieldName":"uname","formatAs":"null","order":"asc"}
 	# ], 
 	# "limit":"5"
 	# }

 	# curl 
 	# --header "Content-type:text/plain" 
 	# --request POST 
 	# --data '{
 	# 	"tableName":"testq", 
 	# 	"factMap":[
 	# 		{"fieldName":"uid","formatAs":"null"},
 	# 		{"fieldName":"uname","formatAs":"null"},
 	# 		{"fieldName":"usalary","formatAs":"null"}
 	# 	], 
 	# 	"conditionsMap":[
 	# 		{"fieldName":"uregion","formatAs":"null","comparision":"IN","value":["Region 1","Region 3"]}
 	# 	]
 	# }' http://localhost:9000/query
 	# s.get_data("testq", [{"fieldName" => "uregion", "formatAs" => nil}, {"fieldName" => "uname", "formatAs" => nil}], "usalary", "sum", "uregion", "asc", nil)
	def get_data(data_source, table_name, dimensions, factMap, 
		sortMap, sort_order, limit, offset, conditionsMap, 
		display_rank, selectionMap, forecastObject=nil, aggregateObject=nil)
		curl = nil
		begin			
			fn_start = Time.now.to_f
			last_update_time = data_source.updated_at
			# Check parameters and raise exception
			dimension_format = "null" if dimension_format.nil?
			fact_format = "null" if fact_format.nil?
			sort_order = "ASC" if sort_order.nil?

			# if sort_key
			# 	sortMap = [
			# 		{"fieldName" => sort_key, "formatAs" => "", "order" => sort_order}
			# 	]
			# end
			
			data = {
					"tableName" => table_name,
					"dimensionMap" => dimensions,
					"factMap" => factMap,
					"sortMap" => sortMap,
					"sortOrder" => sort_order,
					"rank" => display_rank,
					"api_key" => "#{Cibids::API_KEY}"			
				}
			data["selectionsMap"] = selectionMap if selectionMap && !selectionMap.empty?
			data["limit"] = limit if limit
			data["offset"] = offset if offset
			data["conditionsMap"] = conditionsMap if conditionsMap
			data["forecastObject"] = forecastObject if forecastObject
			data["aggregateObject"] = aggregateObject if aggregateObject
			data = data.to_json
			url =  "#{Cibids::URL}/query"
			# Get From Cache
			if Cibids::caching_enabled?
				puts("%%%%%%%%%%%%%%%%%%%%%%%%%%%% from caching %%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
				cache_key = Cibids::get_data_key(data, last_update_time)
				result = Cibids::cache_get(cache_key)	
				if result				
					fn_end = Time.now.to_f
					Rails.logger.info "\n ----- Get Data (Cache) Execution Time #{fn_end - fn_start}s ----- \n"
					return result 
				end
			end

			curl = Curl::Easy.http_post(url, data) do |c|
				c.headers['Content-type'] = 'text/plain'
				c.timeout = 300
			end	

			if curl.response_code != 200
				curl.close unless curl.nil?
				puts "Curl Returned an error response code. #{curl.body_str}"
				Rails.logger.error "Curl Returned an error response code"
				return false
			end
			result = JSON::parse(curl.body_str)
			curl.close unless curl.nil?
			Cibids::cleanup 

			if Cibids::caching_enabled?
				Cibids::cache_set(cache_key, result, Cibids::GET_DATA_KEY_TIMEOUT) if result
			end

			fn_end = Time.now.to_f
			Rails.logger.info "\n ----- Get Data (No Cache) Execution Time #{fn_end - fn_start}s ----- \n"

			result
		rescue Exception => e
			curl.close unless curl.nil?
			puts "Curl Failed #{e.message}"
			Rails.logger.error "Curl Failed #{e.message}"
			return raise e.message
		end
		
	end

	def get_rolled_up_data(table_name, dimensionsMap, factMap, conditionsMap)
		curl = nil
		begin
			# Check parameters and raise exception
			dimension_format = "null" if dimension_format.nil?
			fact_format = "null" if fact_format.nil?
			sort_order = "null" if sort_order.nil?
			dimensionsMap.unshift(dimensionsMap.pop)
			data = {
					"tableName" => table_name,
					"dimensionMap" => dimensionsMap,
					"factMap" => factMap,
					"api_key" => "#{Cibids::API_KEY}"
				}			

			data["conditionsMap"] = conditionsMap if conditionsMap

			data = data.to_json
			url =  "#{Cibids::URL}/queryWithRollup"
			curl = Curl::Easy.http_post(url, data) do |c|
				c.headers['Content-type'] = 'text/plain'
				c.timeout = 300
			end	
			if curl.response_code != 200
				curl.close unless curl.nil?
				puts "Curl Returned an error response code. #{curl.body_str}"
				Rails.logger.error "Curl Returned an error response code"
				return false
			end
			result = JSON::parse(curl.body_str)
			curl.close unless curl.nil?
			Cibids::cleanup 
			result
		rescue Exception => e
			curl.close unless curl.nil?
			puts "Curl Failed #{e.message}"
			Rails.logger.error "Curl Failed #{e.message}"
			return false
		end
	end

	def get_total(table_name, conditionsMap = nil)
		curl = nil

		begin
			data = {
					"tableName" => table_name,
					"factMap" => [{
						"fieldName" => '*',
						"formatAs" => "count"
					}],
					"api_key" => "#{Cibids::API_KEY}"
				}	
			data["conditionsMap"] = conditionsMap if conditionsMap						

			# if Cibids::caching_enabled?
			# 	cache_key = Cibids::get_total_cache_key(data.to_json)
			# 	result = Cibids::cache_get(cache_key)	
			# 	if result				
			# 		fn_end = Time.now.to_f					
			# 		Rails.logger.info "\n ----- Get Data (Cache) Execution Time #{fn_end - fn_start}s ----- \n"
			# 		return result 
			# 	end
			# end

			url =  "#{Cibids::URL}/query"
			curl = Curl::Easy.http_post(url, data) do |c|
				c.headers['Content-type'] = 'text/plain'
				c.timeout = 300
			end	
			if curl.response_code != 200
				curl.close unless curl.nil?
				puts "Curl Returned an error response code. #{curl.response_code}"
				Rails.logger.error "Curl Returned an error response code #{curl.response_code}"
				return false
			end
			result = JSON::parse(curl.body_str)
			curl.close unless curl.nil?
			Cibids::cleanup

			ret = result[0]["count(*)"]

			# if Cibids::caching_enabled?
			# 	Cibids::cache_set(cache_key, ret, Cibids::TOTALS_KEY_TIMEOUT) if result
			# end
			ret
			
		rescue Exception => e
			curl.close unless curl.nil?
			puts "Curl Failed #{e.message}"
			Rails.logger.error "Curl Failed #{e.message}"
			return false
		end
	end

	def get_bookmark_value(table_name, bookmark_key, bookmark_comparison)
		curl = nil
		case bookmark_comparison			
		when ">"
			bookmark_operation="MAX"
		when "<"
			bookmark_operation="MIN"
		end
		begin
			data = {
					"tableName" => table_name,
					"factMap" => [{
						"fieldName" => bookmark_key,
						"formatAs" => bookmark_operation
					}],
					"api_key" => "#{Cibids::API_KEY}"
				}	
			data["conditionsMap"] = nil						
			url =  "#{Cibids::URL}/query"
			curl = Curl::Easy.http_post(url, data) do |c|
				c.headers['Content-type'] = 'text/plain'
				c.timeout = 300
			end	
			if curl.response_code != 200
				curl.close unless curl.nil?
				puts "Curl Returned an error response code. #{curl.response_code}"
				Rails.logger.error "Curl Returned an error response code #{curl.response_code}"
				return false
			end
			result = JSON::parse(curl.body_str)
			curl.close unless curl.nil?
			Cibids::cleanup
			ret = result[0]["#{bookmark_operation}(`#{bookmark_key}`)"]
			ret
			
		rescue Exception => e
			curl.close unless curl.nil?
			puts "Curl Failed #{e.message}"
			Rails.logger.error "Curl Failed #{e.message}"
			return false
		end
	end

	def get_unique_keys(table_name, field_name, formatAs, last_update_time)
		curl = nil
		begin		
			if Cibids::caching_enabled?
				cache_key = Cibids::get_unique_keys_cache_key(table_name, field_name, formatAs, last_update_time)
				result = Cibids::cache_get(cache_key)	
				if result
					return result 
				end
			end	
			formatted_name = self.get_unique_field(field_name,formatAs);		
			data = {
					"tableName" => table_name,
					"factMap" => [{
						"fieldName" => formatted_name,
						"formatAs" => 'DISTINCT',
						"displayName" => field_name
					}],
					"api_key" => "#{Cibids::API_KEY}"
				}		
			url =  "#{Cibids::URL}/query"
			curl = Curl::Easy.http_post(url, data) do |c|
				c.headers['Content-type'] = 'text/plain'
				c.timeout = 300
			end	
			if curl.response_code != 200
				curl.close unless curl.nil?
				puts "Curl Returned an error response code. #{curl.response_code}"
				Rails.logger.error "Curl Returned an error response code #{curl.response_code}"
				return false
			end
			result = JSON::parse(curl.body_str)
			curl.close unless curl.nil?

			Cibids::cleanup			

			if Cibids::caching_enabled?
				Cibids::cache_set(cache_key, result, Cibids::UNIQUE_KEYS_TIMEOUT) if result
			end
			
			result
		rescue Exception => e
			curl.close unless curl.nil?
			Cibids::cleanup
			puts "Curl Failed #{e.message}"
			Rails.logger.error "Curl Failed #{e.message}"
			return false
		end
	end	

	def get_unique_field(field_name,formatAs)
		if formatAs == 'Quarter'
			field = "CONCAT(YEAR([#{field_name}]),'Q',QUARTER([#{field_name}]))"
		elsif formatAs == 'Month Year'
			field = "CONCAT(YEAR([#{field_name}]),' ',Month([#{field_name}]))"
		elsif formatAs == 'Week'
			field = "CONCAT('W',WEEK([#{field_name}]))"			
		else
			field = "#{formatAs}([#{field_name}])"
		end
		field
	end

	def delete_data(table_name, data_content_id)
		curl = nil
		begin
			data = {
				"tableName" => table_name,
				"data_content_id" => data_content_id,
				"api_key" => "#{Cibids::API_KEY}"
			}
			url =  "#{Cibids::URL}/deleteData"
			curl = Curl::Easy.http_post(url, data) do |c|
				c.headers['Content-type'] = 'text/plain'
				c.timeout = 300
			end	
			if curl.response_code != 200
				curl.close unless curl.nil?
				Cibids::cleanup
				puts "Curl Returned an error response code. #{curl.body_str}"
				Rails.logger.error "Curl Returned an error response code #{curl.body_str}"
				return false
			end			
			curl.close unless curl.nil?
			Cibids::cleanup
			true
		rescue Exception => e
			curl.close unless curl.nil?
			Cibids::cleanup
			puts "Curl Failed #{e.message}"
			Rails.logger.error "Curl Failed #{e.message}"
			return false
		end
	end

	def drop_table(table_name)
		curl = nil
		begin
			data = {
				"tableName" => table_name,
				"api_key" => "#{Cibids::API_KEY}"
			}
			url =  "#{Cibids::URL}/deleteTable"
			curl = Curl::Easy.http_post(url, data) do |c|
				c.headers['Content-type'] = 'text/plain'
				c.timeout = 300
			end	
			if curl.response_code != 200
				curl.close unless curl.nil?
				Cibids::cleanup
				puts "Curl Returned an error response code. #{curl.body_str}"
				Rails.logger.error "Curl Returned an error response code #{curl.body_str}"
				return false
			end			
			curl.close unless curl.nil?
			Cibids::cleanup
			true
		rescue Exception => e
			curl.close unless curl.nil?
			Cibids::cleanup
			puts "Curl Failed #{e.message}"
			Rails.logger.error "Curl Failed #{e.message}"
			return false
		end
	end

	def replace_table(old_table_name, new_table_name)
		curl = nil
		begin
			data = {
				"oldTableName" => old_table_name,
				"newTableName" => new_table_name,
				"api_key" => "#{Cibids::API_KEY}"
			}
			url =  "#{Cibids::URL}/replaceTable"
			curl = Curl::Easy.http_post(url, data) do |c|
				c.headers['Content-type'] = 'text/plain'
				c.timeout = 300
			end	
			if curl.response_code != 200
				curl.close unless curl.nil?
				Cibids::cleanup
				puts "Curl Returned an error response code. #{curl.body_str}"
				Rails.logger.error "Curl Returned an error response code #{curl.body_str}"
				return false
			end			
			curl.close unless curl.nil?
			Cibids::cleanup
			true
		rescue Exception => e
			curl.close unless curl.nil?
			Cibids::cleanup
			puts "Curl Failed #{e.message}"
			Rails.logger.error "Curl Failed #{e.message}"
			return false
		end
	end	

	def self.cleanup
		curl = Curl::Easy.new
		curl.close		
		GC.start
	end


	def self.get_unique_keys_cache_key(table_name, field_name, format_as, last_update_time)
		tname = table_name.gsub(/\s+/, '')
		fname = field_name.gsub(/\s+/, '')
		format = format_as.gsub(/\s+/, '')
		return "unique_key_#{tname}_#{fname}_#{format_as}_#{last_update_time}"
	end

	def self.get_total_cache_key(data)		
		hash = Digest::MD5.hexdigest(data)		
		return "total_key_#{hash}"
	end

	def self.get_data_key(data, time) 
		hash = Digest::MD5.hexdigest(data)
		return "get_data_key_#{hash}_#{time.to_s}"
	end

	protected
	def self.cache_get(key)
		if $redis
			val = $redis.get(key)
			return val ? JSON.parse(val) : val
		else
			puts "\n[ERROR] [CRITICAL] Cache not initialized!"			
		end 
	end

	def self.cache_set(key, value, timeout)
		if $redis
			$redis.setex(key, timeout, value.to_json)
		else
			puts "\n[ERROR] [CRITICAL] Cache not initialized!"			
		end 
	end

	def self.caching_enabled?
		return Rails.env == "production" || $default_caching_state
	end

end
