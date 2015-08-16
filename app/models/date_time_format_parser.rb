module DateTimeFormatParser

	def self.get_formatted_date(date, format)
		# seperator = get_seperator(format['date_format'])
		# format_str = format['date_format'].split(seperator).map do |f|
		#   if f == 'mm' || f == 'm'
		#     '%m'
		#   elsif f == 'dd' || f == 'd'
		#     '%d'
		#   elsif f == 'yy'
		#     '%y'
		#   elsif f == 'yyyy'
		#     '%Y'
		#   elsif f == 'MON'
		# 	'%b'
		#   end
		# end.join(seperator)
		  	
		format_str=self.get_date_specifier(date, format)
		Date.strptime(date, format_str).strftime("%Y/%m/%d")
	end

	def self.get_formatted_time(time, format)
		format_str = format['time_format'].gsub('hh','%H')
										  .gsub('mm','%M')
										  .gsub('ss','%S')
										  .gsub('h','%H')
										  .gsub('m','%M')
										  .gsub('s','%S')
										  .gsub('AM/PM','%p')		
		Time.strptime(time, format_str).strftime("%H:%M:%S")
	end

	def self.get_formatted_datetime(datetime, format)
		# seperator = get_seperator(format['date_format'])
		# date_str = format['date_format'].split(seperator).map do |f|
		#   if f == 'mm' || f == 'm'
		#     '%m'
		#   elsif f == 'dd' || f == 'd'
		#     '%d'
		#   elsif f == 'yy'
		#     '%y'
		#   elsif f == 'yyyy'
		#     '%Y'
		#   elsif f == 'MON'
		# 	'%b'
		#   end
	 #    end.join(seperator)  	 	
	 	date = datetime.split(/\s/)[0]
	 	date_str=self.get_date_specifier(date, format['date_format'])

		time_str = format['time_format'].gsub('hh','%H')
										.gsub('mm','%M')
										.gsub('ss','%S')
										.gsub('h','%H')
										.gsub('m','%M')
										.gsub('s','%S')
										.gsub('AM/PM','%p')
		format_str = "#{date_str} #{time_str}"		
		Time.strptime(datetime, format_str).strftime("%Y/%m/%d %H:%M:%S")
	end	

	def self.get_seperator(date_format)
		if date_format.include?('-') 
			seperator ='-' 
		elsif date_format.include?('/') 
			seperator = '/'
		else
			seperator = nil
		end
		seperator
	end

	def self.get_date_specifier(date, format)
		seperator = get_seperator(date)
		parts = date.split(seperator)

		digits = parts.map do |part|
			part.size
		end

		specifier = ""
		case format 			
		when "Month, Day, Year"						
			month_specifier = get_part_specifier(digits[0], "Month")
			day_specifier = get_part_specifier(digits[1], "Day")
			year_specifier = get_part_specifier(digits[2], "Year")
			return "#{month_specifier}#{seperator}#{day_specifier}#{seperator}#{year_specifier}"
		when "Day, Month, Year"
			day_specifier = get_part_specifier(digits[0], "Day")
			month_specifier = get_part_specifier(digits[1], "Month")			
			year_specifier = get_part_specifier(digits[2], "Year")
			return "#{day_specifier}#{seperator}#{month_specifier}#{seperator}#{year_specifier}"
		when "Year, Month, Day"
			year_specifier = get_part_specifier(digits[0], "Year")
			month_specifier = get_part_specifier(digits[1], "Month")
			day_specifier = get_part_specifier(digits[2], "Day")
			return "#{year_specifier}#{seperator}#{month_specifier}#{seperator}#{day_specifier}"
		else
			return false
		end
	end		

	def self.get_part_specifier (part_length, part_name)
		case part_name
		when "Month"
			return part_length == 3 ? "%b" :  ( part_length == 1 || part_length == 2) ?  "%m" : nil
		when "Day"
			return part_length == 1 || part_length == 2 ? "%d" : nil
		when "Year"
			return part_length == 1 || part_length == 2 ? "%y" : part_length == 4 ? "%Y" : nil
		else
			return nil
		end
	end

end