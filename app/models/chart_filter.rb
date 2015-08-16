class ChartFilter < AuditedModel
    attr_accessible :field_name, :format_as, :comparison_operator, :field_values, :exclude, :chart_id, :disabled, 
    				:field_data_type, :date_range, :upper_range, :lower_range, :reference_direction, 
    				:reference_count, :reference_unit, :reference_date_today, :reference_date, :display_name, 
    				:is_global, :user_id

    belongs_to :chart
    
    
	COMPARISON_OPERATOR = [
		"in",
		"lt",
		"gt",
		"not in",
		"not null"
	]
	
	def self.operator_type(operator)
		return self::COMPARISON_OPERATOR.index(operator)
	end

	def self.operator(operator_type)
		return self::COMPARISON_OPERATOR[operator_type]
	end

	def self.create_chart_filter(params)
		chart_filter = ChartFilter.create(params)
		chart_filter
	end

	def get_months_index(month_names)
		arr = []
		month_names.each do |name|
			arr << Date::MONTHNAMES.index(name)
		end
		arr
	end

	def get_condition
		operator = self.get_operator
		values = self.field_values ? self.get_filter_values : nil
		format_as = self.format_as
		arr = []

		# {"fieldName" => self.field_name, "formatAs" => self.format_as,"dataType" => "string",
		# "comparision" => operator, "value" => values}					
		if format_as == 'Month'
			values = get_months_index(values)
			arr << {"fieldName" => self.field_name, "formatAs" => format_as,"dataType" => "string",
		"comparision" => operator, "value" => values}
		elsif format_as == 'Month Year'
			vals = []
 			values.each do |val|
 				value = val.split(' ')
 				vals << "#{value[0]} "+("%02d" % Date::ABBR_MONTHNAMES.index(value[1]))				
 			end
 			values=vals
 			arr <<
 		         {"fieldName" => self.field_name, "formatAs" => format_as,"dataType" => "string",
			 "comparision" => self.get_operator,"value" => values}	
		else
			if(self.comparison_operator == 5 && self.date_range == true)
				get_range_condition(arr)
			elsif(self.comparison_operator == 5 && self.date_range == false)
				get_reference_condition(arr)
			else
				values = values
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
		operator = self.comparison_operator
		if operator == 1 || operator == 2
			val =val.to_i
		end
		val
	end
end
