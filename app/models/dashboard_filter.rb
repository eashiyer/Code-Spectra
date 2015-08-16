class DashboardFilter < AuditedModel
  attr_accessible :comparison_operator, :dashboard_id, :field_name, :field_values, :field_data_type,
  				  :format_as, :disabled, :date_range, :upper_range, :lower_range, :reference_direction,
  				  :reference_count, :reference_unit, :reference_date_today, :reference_date, :display_name,
  				  :is_global, :user_id, :predefined_range

  belongs_to :dashboard
  

  
	COMPARISON_OPERATOR = [
		"in",
		"lt",
		"gt",
		"not in"
	]

	def self.operator_type(operator)
		return self::COMPARISON_OPERATOR.index(operator)
	end

	def self.operator(operator_type)
		return self::COMPARISON_OPERATOR[operator_type]
	end

	def get_months_index(month_names)
		if month_names
			arr = []
			month_names.each do |name|
				arr << Date::MONTHNAMES.index(name)
			end
			arr
		end
	end

	# def get_quarter(years)
	# 	arr = []
	# 	years.each do |y|
	# 		arr << Date::MONTHNAMES.index(name)
	# 	end
	# 	arr
	# end

	def get_condition
		operator = self.get_operator
		format_as = self.format_as
		arr = []
		if format_as == 'Month'			
			if (self.comparison_operator == 5 && !self.predefined_range.nil?)
				get_predefined_conditions(arr)
			elsif(self.comparison_operator == 5 && self.date_range == true)
				get_range_condition(arr)
			elsif(self.comparison_operator == 5 && self.date_range == false)
				get_reference_condition(arr)
			else
				values = get_months_index(self.get_filter_values)
				arr << {"fieldName" => self.field_name, "formatAs" => format_as,"dataType" => "string",
						"comparision" => operator, "value" => values}
			end
		elsif format_as == 'Month Year'
			if self.get_filter_values
				vals = []
	 			self.get_filter_values.each do |val|
	 				value = val.split(' ')
	 				vals << "#{value[0]} "+("%02d" % Date::ABBR_MONTHNAMES.index(value[1]))
	 				# vals << "#{value[0]} #{Date::ABBR_MONTHNAMES.index(value[1])}"				
	 			end
 				values=vals
 			end
 			arr <<
 		         {"fieldName" => self.field_name, "formatAs" => format_as,"dataType" => "string",
			 "comparision" => self.get_operator,"value" => (values || nil)}	
		elsif format_as == 'Quarter'
 			arr <<
 		         {"fieldName" => self.field_name, "formatAs" => format_as,"dataType" => "string",
			 "comparision" => self.get_operator,"value" => self.get_filter_values}	
		else
			if (self.comparison_operator == 5 && !self.predefined_range.nil?)
				get_predefined_conditions(arr)
			elsif(self.comparison_operator == 5 && self.date_range == true)
				get_range_condition(arr)
			elsif(self.comparison_operator == 5 && self.date_range == false)
				get_reference_condition(arr)
			else
				values = self.field_values ? self.get_filter_values : nil
			arr << {"fieldName" => self.field_name, "formatAs" => format_as,"dataType" => "string",
			"comparision" => operator, "value" => values}	
			end
		end
		arr	
	end

	def get_range_condition(arr)
	        arr << {"fieldName" => self.field_name, "formatAs" => self.format_as,"dataType" => "string",
			 "comparision" => ">","value" => self.lower_range}
		 	arr << {"fieldName" => self.field_name, "formatAs" => self.format_as,"dataType" => "string",
			 "comparision" => "<","value" => self.upper_range}			 
	end

	def get_reference_condition(arr)
		reference_date = self.reference_date_today ? Date.today : self.reference_date
		if self.reference_direction == 'previous'		
			start_date = reference_date - self.reference_count.send(self.reference_unit.downcase)
			end_date = reference_date	
		else
			start_date = reference_date
			end_date = reference_date + self.reference_count.send(self.reference_unit.downcase)	
		end
    		arr << {"fieldName" => self.field_name, "formatAs" => self.format_as,"dataType" => "string",
			 "comparision" => ">","value" => start_date}
		 	arr << {"fieldName" => self.field_name, "formatAs" => self.format_as,"dataType" => "string",
			 "comparision" => "<","value" => end_date}
	end

	def get_predefined_conditions(arr)
		case self.predefined_range.downcase
			when "today"
				start_date = DateTime.now.end_of_day - 1.day
				end_date = DateTime.now.end_of_day
			when "yesterday"
				start_date = DateTime.now.end_of_day - 2.day
				end_date = DateTime.now.beginning_of_day
			when "current week" 
				start_date = DateTime.now.beginning_of_week(start_day = :sunday)
				end_date = DateTime.now
			when "last 7 days" 
				start_date = DateTime.now - 7.days
				end_date = DateTime.now
			when "previous week" 
				start_date = DateTime.now.prev_week.beginning_of_week(start_day = :sunday)
				end_date = start_date + 7.days
			when "previous business week" 
				start_date = DateTime.now.prev_week.beginning_of_week(start_day = :sunday)
				end_date = start_date + 5.days
			when "last 30 days"
				start_date = DateTime.now - 30.days
				end_date = DateTime.now				
			when "current month to date"
				start_date = DateTime.now.beginning_of_month
				end_date = DateTime.now					
			when "last month to date"
				start_date = DateTime.now.prev_month.beginning_of_month
				end_date = DateTime.now
			when "current calendar quarter"
				start_date = DateTime.now.beginning_of_quarter
				end_date = DateTime.now.end_of_quarter
			when "previous 3 months"
				start_date = (DateTime.now - 3.months).beginning_of_month
				end_date = start_date + 3.months	
			when "the last 3 months to date"
				start_date = (DateTime.now - 3.months).beginning_of_month
				end_date = DateTime.now					
			when "the last 12 months to date"
				start_date = (DateTime.now - 12.months).beginning_of_month
				end_date = DateTime.now					
			when "last 365 days"
				start_date = DateTime.now - 365.days
				end_date = DateTime.now					
			when "current year to date"
				start_date = DateTime.now.beginning_of_year
				end_date = DateTime.now	
			when "previous calendar year"
				start_date = DateTime.now.prev_year.beginning_of_year
				end_date = DateTime.now.prev_year.end_of_year

			## Datetime formats
			when "last 5 minutes"
				start_date = DateTime.now - 5.minutes
				end_date = DateTime.now
			when "last 10 minutes"
				start_date = DateTime.now - 10.minutes
				end_date = DateTime.now				
			when "last 30 minutes"
				start_date = DateTime.now - 30.minutes
				end_date = DateTime.now				
			when "last hour"
				start_date = DateTime.now - 1.hours
				end_date = DateTime.now				
			when "last 3 hours"
				start_date = DateTime.now - 3.hours
				end_date = DateTime.now				
			when "last 8 hours"
				start_date = DateTime.now - 8.hours
				end_date = DateTime.now				
			when "last 12 hours"
				start_date = DateTime.now - 12.hours
				end_date = DateTime.now				
			when "last 24 hours"
				start_date = DateTime.now - 24.hours
				end_date = DateTime.now				
			when "last three days to date/time"
				start_date = (DateTime.now - 3.days).beginning_of_day
				end_date = DateTime.now				
			when "this week to date/time"
				start_date = DateTime.now.beginning_of_week(start_day = :sunday)
				end_date = DateTime.now				
			when "last week to date/time (last 7 x 24 hours)"
				start_date = DateTime.now.prev_week.beginning_of_week(start_day = :sunday)
				end_date = start_date + 7.days			
			when "last two weeks to date/time (last 14 x 24 hours)"
				start_date = (DateTime.now - 2.weeks).beginning_of_week(start_day = :sunday)
				end_date = start_date + 14.days	
			when "last three weeks to date/time (last 21 x 24 hours)"
				start_date = (DateTime.now - 3.weeks).beginning_of_week(start_day = :sunday)
				end_date = start_date + 21.days					
			when "past month to date/time (this date last month till now)"
				start_date = DateTime.now.prev_month.beginning_of_month
				end_date = DateTime.now				
			when "this year to date/time"	
				start_date = DateTime.now.beginning_of_year
				end_date = DateTime.now		
		end
        arr << {"fieldName" => self.field_name, "formatAs" => self.format_as,"dataType" => "string",
		 "comparision" => ">","value" => start_date}
	 	arr << {"fieldName" => self.field_name, "formatAs" => self.format_as,"dataType" => "string",
		 "comparision" => "<","value" => end_date}
	end

	def get_operator
		case self.comparison_operator
		when 0
			return "IN"
		when 1
			return "<"
		when 2
			return ">"
		when 3
			return "NOT IN"
		when 4 
			return "IS NOT NULL"
		when 6
			return "MAX"
		when 7
			return "MIN"
		else
			return "IN" #default
		end
	end

	def get_filter_values
		unless self.field_values
			return nil			
		end
		val = JSON.parse(self.field_values, quirks_mode: true)		
		if self.comparison_operator == 1 || self.comparison_operator == 2
			val =val.to_i
		end
		val
	end

end
