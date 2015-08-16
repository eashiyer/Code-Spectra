class ModelScript
	require 'csv'


	def remodel_preview_data(field_str, preview_data, combine_columns, new_keys_column, new_values_column)
		#field_arr = JSON.parse(field_str).reduce({}, :merge).collect{|k,v| k}
		field_arr = JSON.parse(field_str).collect{|a| a["name"]}
		pivot_keys = combine_columns.split(',')	
		pivot_key_target = new_keys_column
		pivot_value_target = new_values_column
		copy_keys = field_arr - pivot_keys
		parsed_data = JSON.parse(preview_data)
		parsed_data = parsed_data.class == Array ? parsed_data : parsed_data['data'] 
		lines = parsed_data.map {|a| Hash[ field_arr.zip(a) ] }

		records = []
		lines.each do |line|
		        line.keys.each do |k|	        	
		                if(pivot_keys.include?(k))
		                        record = {}
		                        copy_keys.each do |ck|
		                                record[ck] = line[ck]
		                        end
		                        record[pivot_key_target] = k
		                        record[pivot_value_target] = line[k] #is_valid_number?(line[k]) ? line[k] : '-'
		                        records << record
		                end
		        end
		end

		target_keys = copy_keys.push(pivot_key_target)
		target_keys = target_keys.push(pivot_value_target)
		str = CSV.generate do |csv|
		  csv << target_keys
		  records.each do |x|
		    csv << x.values
		  end
		end
		str
	end

	def remodel_table_data(field_str, data, combine_columns, new_keys_column, new_values_column)
		field_arr = JSON.parse(field_str).collect{|a| a["name"]}
		pivot_keys = combine_columns.split(',')	
		pivot_key_target = new_keys_column
		pivot_value_target = new_values_column
		copy_keys = field_arr - pivot_keys
	
		lines = JSON.parse(data).map {|a| Hash[ field_arr.zip(a) ] }

		records = []
		
		lines.each do |line|
		        line.keys.each do |k|	        	
		                if(pivot_keys.include?(k))
		                        record = {}
		                        copy_keys.each do |ck|
		                                record[ck] = line[ck]
		                        end
		                        record[pivot_key_target] = k
		                        record[pivot_value_target] = line[k] #is_valid_number?(line[k]) ? line[k] : '-'
		                        records << record
		                end
		        end
		end
		records
	end

end
