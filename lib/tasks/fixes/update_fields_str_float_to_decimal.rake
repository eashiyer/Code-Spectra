namespace :fixes do
	desc "Rake task to to convert array to hash in field_str field"
	task :convert_float_to_decimal => :environment do
		ActiveRecord::Base.transaction do
			puts "Updating database fields"		
			convert_float_to_decimal
		end
	end
end

def convert_float_to_decimal
	records = DataSource.all.select { |ds| ds.fields_str.include? "decimal" if ds.fields_str }
	records.each do |r|
		puts "Updating Data Source #{r.id}\n"		
		newArr = []
		if r.fields_str
			field_arr = JSON.parse(r.fields_str)					
			field_arr.each do |f|
				hash = {}
				f.each do |k,v|
					if v == "decimal"
						hash[k] = "decimal(15,3)"
					else
						hash[k] = v
					end
				end
				newArr << hash
			end
		end		
		r.update_attributes(:fields_str => newArr.to_json) 
	end	
end

