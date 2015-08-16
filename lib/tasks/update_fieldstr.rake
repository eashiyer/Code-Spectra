namespace :database do
	desc "Rake task to to convert array to hash in field_str field"
	task :update_fieldstr => :environment do
		ActiveRecord::Base.transaction do
			puts "Updating database field"		
			update_fieldstr
			puts "\nUpdating Done"
		end
	end
end

def update_fieldstr
	records = DataSource.all
	i = 0
	j = 0
	failed_arr = []
	records.each do |r|
		if r.fields_str
			begin
				field_arr = JSON.parse(r.fields_str)
				unless field_arr[0].length > 1		
					newArr = []
					field_arr.each do |f|
						hash = {}
						hash['name'] = f.keys[0]
						hash['display_name'] = f.keys[0]
						data_type = get_data_type(f.values[0])
						hash['data_type'] = data_type
						options = get_options(f.values[0])
						hash['options'] = options
						hash['default'] = nil
						newArr << hash
					end
					r.update_attributes(:fields_str => newArr.to_json, :dimensions_str => nil) 
					print "\r#{i += 1} records updated"
				end
			rescue => e
				j += 1
				failed_arr.push(r.id)
			end
		end		
	end	
	puts "\n#{j} failed"
	puts "failed ids: #{failed_arr}" unless failed_arr.empty?
end

def get_options(data_type)
	if ['varchar','varchar(200)', 'varchar(45)'].include?(data_type) || data_type.include?("varchar")
		options = {:string_length => "200"}	
	elsif ['decimal','decimal(15,3)','decimal(15,5)', 'float'].include?(data_type) || data_type.include?('decimal') || data_type.include?('float')
		options = {:max_digits => "15", :max_decimals => "3"}
	elsif ['date'].include?(data_type)
		options = {:date_format => "Month, Day, Year"}
	else
		options = {}
	end
	options.to_json
end

def get_data_type(data_type)
	if data_type == 'varchar(200)' || data_type == 'varchar(45)' || data_type.include?("varchar")
		type = 'varchar'
	elsif ['decimal(15,3)','decimal(15,5)'].include?(data_type) || data_type.include?('decimal') || data_type.include?('float')
		type = 'decimal'
	elsif data_type == 'date'
		type = 'date'
	elsif ['int', 'integer', 'int(10)', 'int(11)'].include?(data_type) || data_type.include?("int")
		type = 'integer'
	end
	type
end

