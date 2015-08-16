class UserFilter < AuditedModel
  	attr_accessible :field_name, :display_name, :format_as, :comparison_operator, :field_values, 
      :disabled, :hide, :user_id, :data_source_id

    belongs_to :user
    belongs_to :data_source
    

    validates_presence_of :data_source_id, :user_id

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

	def get_months_index(month_names)
		arr = []
		month_names.each do |name|
			arr << Date::MONTHNAMES.index(name)
		end
		arr
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


	def get_condition
		return [] unless self.field_name
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
 				vals << "#{value[0]} #{Date::ABBR_MONTHNAMES.index(value[1])}"				
 			end
 			values=vals
 			arr <<
 		         {"fieldName" => self.field_name, "formatAs" => format_as,"dataType" => "string",
			 "comparision" => self.get_operator,"value" => values}	
		else
			values = values
			arr << {"fieldName" => self.field_name, "formatAs" => format_as,"dataType" => "string",
		"comparision" => operator, "value" => values}	
		end		
		arr
	end
end
