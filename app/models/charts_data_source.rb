# == Schema Information
#
# Table name: charts_data_sources
#
#  id                  :integer          not null, primary key
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  chart_id            :integer
#  data_source_id      :integer
#  count               :integer
#  dimension_name      :string(255)
#  dimension_format_as :string(255)
#  depth               :string(255)
#  fact                :string(255)
#  fact_type           :string(255)
#  fact_unit           :string(255)      default("Rs")
#  fact_format         :string(255)      default("sum")
#  isolated			   :boolean			 default(FALSE)

class ChartsDataSource < AuditedModel
	attr_accessible :dimension_name, :depth, 
					:dimension_format_as,
					:fact, :fact_type, :fact_unit, :fact_format, :count, :fact_display,
					:chart_id, :data_source_id, :is_calculated, :account_template_id, :isolated

	belongs_to :chart
	belongs_to :data_source
	belongs_to :account_template
	validates_presence_of :data_source_id
		

	CALCULATED_FORMATS = ['sum','avg', 'count']


	def raw_data(filters, limit, offset, sort_key, sort_order, fields=nil, is_underlying_data=false, option_value=nil)
		cibids = Cibids.new
		sort_key = sort_key 
		sort_order = sort_order
		@is_underlying_data=is_underlying_data
		@option_value=option_value
		table_name = "#{self.data_source_id}_contents"
		@chart_configs = JSON.parse(self.chart.configs) if self.chart.configs
		@chart_configs = @chart_configs || {}
		factMap=[]
		dimensionsMap = []
		if fields			
			fields=JSON.parse(fields)
			fields.each do |field|
				factMap.push({"fieldName" => field, "formatAs" => ""}) if field.to_s != ''
			end
		else
			factMap.push({"fieldName" => '*', "formatAs" => ""})
		end

		if filters
			@filters = JSON.parse(filters)
		end
		self.get_condition_map
		
 	    @conditionsMap = @conditionsMap.empty? ? nil : @conditionsMap

 	    # limit = limit ? limit : 10
 	    offset = offset ? offset : 0
		self.get_selection_map

		results = cibids.get_data(self.data_source, table_name, dimensionsMap, factMap, @sortMap, @sort_order, limit, offset, @conditionsMap, false, @selectionMap)
		unless results
			return []
		end
		total = cibids.get_total(table_name, @conditionsMap)
		[{"results" => results, "count" => total}]
	end


	def self.formatted_value(val, format)
		case format			
		when "Quarter"
			begin		
				date = Date.strptime(val, "%m/%d/%y")
				quarter = (date.month - 1) / 3 + 1
				return "#{date.strftime("%Y")}Q#{quarter}"
			rescue
				return ""
			end
		when "Month"
			begin
				date = Date.strptime(val, "%m/%d/%y")
				return date.strftime("%b")
			rescue
				return ""
			end
		when "Year"
			begin
				date = Date.strptime(val, "%m/%d/%y")
				return date.strftime("%Y")
			rescue
				return ""
			end
		when "Month, Year"
			begin
				date = Date.strptime(val, "%m/%d/%y")
				return "#{date.strftime("%b")}, #{date.strftime("%Y")}"
			rescue
				return ""
			end
		when "Date String"
			begin
				date = Date.strptime(val, "%m/%d/%y")
				return "#{date.strftime("%Y/%m/%d")}"
			rescue
				return ""
			end
		when "Number Group"
			num = val.to_i;
        	if(!num) 
        		return "";
        	end
        	lower_bound = Math.floor(num / 10) * 10;
        	upper_bound = lower_bound + 10;
			return lower_bound + "-" + upper_bound;
		end
	end


	def get_condition_map

		@conditionsMap = @conditionsMap || []

		if self.chart.active_chart_filters && self.chart.active_chart_filters.length>0
			self.chart.active_chart_filters.each do |cf|
				@conditionsMap.concat(cf.get_condition)
				# @conditionsMap << cf.get_condition
			end
		end

		if self.chart.dashboard && self.chart.dashboard.active_dashboard_filters
			unless self.chart.isolated
				self.chart.dashboard.active_dashboard_filters.each do |df|
					#if self.data_source.fields.include?(df.field_name)
						@conditionsMap.concat(df.get_condition)
					#end
				end
			end
		end		

		current_user = User.current_user
		if current_user
			@conditionsMap.concat(current_user.get_user_filters(self.data_source_id))
		end

		if @filters
			@filters.each do |f|
				unless self.chart.isolated
			 		if self.data_source.fields.include?(f['dimension'])
		 				formatAs = f['formatAs'] || ''
		 				if self.chart.chart_type == 15 && self.chart.dimensions[0] && f['dimension'] == self.chart.dimensions[0].field_name
				 			@conditionsMap <<
				 				{"fieldName" => f['dimension'], "formatAs" => formatAs,"dataType" => "string",
				 				"comparision" => "<=","value" => f['value']}
		 				else
		 					if f['operator'] == "="
		 						@conditionsMap <<
			 		    	   		{"fieldName" => f['dimension'], "formatAs" => formatAs,"dataType" => "string",
						 			"comparision" => f["operator"],"value" => f['value'][0]}
		 					else
		 						@conditionsMap <<
			 		    	   		{"fieldName" => f['dimension'], "formatAs" => formatAs,"dataType" => "string",
						 			"comparision" => f["operator"],"value" => f['value']}
		 					end
						end					
					end
				end
			end	
		end
		
		if @is_underlying_data!="true"
			if self.chart.excluded_rows
				exr=JSON.parse(self.chart.excluded_rows)
				if exr['values'].length>0
					@conditionsMap <<
		 		        {"fieldName" => exr['fieldname'], "formatAs" => "", "dataType" => "string",
					 "comparision" => exr['operator'],"value" => exr['values']}
				end
			end
		else
			case @option_value			
			when "hideExcludedRows"
				begin		
					if self.chart.excluded_rows
						exr=JSON.parse(self.chart.excluded_rows)
						if exr['values'].length>0
							@conditionsMap <<
				 		        {"fieldName" => exr['fieldname'], "formatAs" => "", "dataType" => "string",
							 "comparision" => "NOT IN","value" => exr['values']}
						end
					end
				rescue
					return ""
				end
			when "showOnlyExcludedRows"
				begin
					if self.chart.excluded_rows
						exr=JSON.parse(self.chart.excluded_rows)
						if exr['values'].length>0
							@conditionsMap <<
				 		        {"fieldName" => exr['fieldname'], "formatAs" => "", "dataType" => "string",
							 "comparision" => "IN","value" => exr['values']}
						end
					end
				rescue
					return ""
				end		
			end
		end

	end

	def get_fact_map
		@sec_conditionsMap = @conditionsMap;
		if @chart_configs["measure_fields"] && @chart_configs["measure_fields"].length>0
			temp=[];
			facts=@chart_configs["measure_fields"]
			facts.each do |fact|
				temp.push({"fieldName" => fact["field"], "formatAs" => fact["format"]}) if fact.to_s != ''
			end
			temp
		else
			case self.fact_format
			when "opspc"
				fact_format = "count"
				@sec_conditionsMap.push({"fieldName" => self.fact, "formatAs" => "","dataType" => "string",
							 "comparision" => "IS NOT NULL","value" => nil})
				# @sec_conditionsMap.push({"fieldName" => self.fact, "formatAs" => "","dataType" => "string",
				# 			 "comparision" => "!=","value" => "-"})
				@sec_conditions = true
				@sec_operation = '%'
			when "noopspc"
				fact_format = "count"
				@sec_conditionsMap.push({"fieldName" => self.fact, "formatAs" => "","dataType" => "string",
							 "comparision" => "IN","value" => [nil,'-']})
				@sec_conditions = true
				@sec_operation = '%'
			when "noops"
				fact_format = "count"
				@sec_conditionsMap.push({"fieldName" => self.fact, "formatAs" => "","dataType" => "string",
							 "comparision" => "IN","value" => [nil,'-']})			
			when "count"
				fact_format = "count"
				@conditionsMap.push({"fieldName" => self.fact, "formatAs" => "","dataType" => "string",
							 "comparision" => "IS NOT NULL","value" => nil})
				@conditionsMap.push({"fieldName" => self.fact, "formatAs" => "","dataType" => "string",
							 "comparision" => "!=","value" => "-"})			
			else
				fact_format = self.fact_format
			end	
			[
				{"fieldName" => self.fact, "formatAs" => fact_format}
			]
		end
	end

	def get_limit
		@limit = @limit || self.count
	end

	def get_sort_map(factMap)
		sort_by_key = self.chart.sort_by_key
		sort_order = self.chart.desc_order ? 'DESC' : 'ASC'
		@sort_order ||= sort_order
		if @sort_key
			@sortMap.push({"fieldName" => @sort_key, "formatAs" => ""}) 
		else
			if sort_by_key && sort_by_key.to_s.downcase == 'true'
				@sortMap.push({"fieldName" => self.dimension_name, "formatAs" => self.dimension_format_as}) 
			else
				if self.chart.chart_type.to_i == 5
					@sortMap.push({"fieldName" => self.dimension_name, "formatAs" => ""})
					if self.depth && !self.depth.blank?
						@sortMap.push({"fieldName" => self.depth, "formatAs" => ""})
					end
				else
					factMap.each do |fact|
						@sortMap.push({"fieldName" => fact["fieldName"], "formatAs" => fact["formatAs"]}) 
					end
				end
				# factMap.each_with_index do |fact, index|
					
				# 	fact_str = self.get_fact_str(fact)
				# 	if index > 0
				# 		@sort_key += ", #{fact_str}"
				# 	else
				# 		@sort_key = fact_str
				# 	end
				# end
			end
		end
	end

	def get_selection_map
		selection_values = @chart_configs["selection_values"]
		if selection_values
			selection_values = selection_values.select { |sv| sv && !sv.strip.empty? }
		end
		if selection_values && !selection_values.empty?
			if selection_values[0].index('$') == 0
				reference_chart_id = selection_values[0].split('_')[1]
				selection_values = Chart.find(reference_chart_id).unique_values				
			end
		end
		if selection_values && !selection_values.empty?
			@selectionMap.push({"fieldName" => self.dimension_name, "comparision" => "IN", "formatAs" => "", "value" => selection_values})
		end
	end

    # CHART DATA METHOD
    def init
	    @conditionsMap = []
	    @dimensionsMap = []
	    @factMap = []
	    @filters = @filters || []
	    @sec_conditions = []    
	    @sortMap = []
		@selectionMap = []
		@display_rank = false
		@sec_conditionsMap = []
    end


    def chart_data(filters, limit, offset, sort_key, sort_order)
	    cibids = Cibids.new

	    table_name = "#{self.data_source_id}_contents"
	    @limit = limit || self.count
	    @offset = offset
	    @sort_key = sort_key
	    @sort_order = sort_order
	    @filters = JSON.parse(filters) unless filters.nil?
		continue = true
		if self.chart.dashboard && !self.chart.isolated && self.chart.dashboard.active_dashboard_filters.present?
			active_dash_arr = self.chart.dashboard.active_dashboard_filters.map{|df| df.field_name}
			unless (active_dash_arr - self.data_source.fields).empty?	   	
				continue = false
			end
		end

		if continue
		    self.init
		    self.generate_dimensions_map
		    self.generate_fact_map
		    self.generate_conditions_map
		    self.generate_sort_map		
		    self.generate_forecast_object    
		    self.generate_aggregate_map

			@query_results = cibids.get_data(self.data_source, table_name, @dimensionsMap, @factMap, @sortMap, @sort_order, @limit, offset, @conditionsMap, @display_rank, @selectionMap, @forecastObject, @aggregateObject)			
			if self.chart.chart_type == 14
				configs=JSON.parse(self.chart.configs)
				if !configs["hide_row_total"] && offset.to_i == 0
					self.generate_row_map
					@row_totals = cibids.get_data(self.data_source, table_name, @dimensionsMap, @factMap, @rowSortMap, @sort_order, nil, nil, @conditionsMap, @display_rank, @selectionMap, @forecastObject, @aggregateObject)
				end
				if !configs["hide_column_total"] && offset.to_i == 0
					self.generate_column_map
					@column_totals = cibids.get_data(self.data_source, table_name, @dimensionsMap, @factMap, @columnSortMap, @sort_order, nil, nil, @conditionsMap, @display_rank, @selectionMap, @forecastObject, @aggregateObject)
				end
				if !configs["hide_row_total"] && !configs["hide_column_total"] && offset.to_i == 0
					@grandTotals = cibids.get_data(self.data_source, table_name, [], @factMap, [], nil, nil, nil, nil, @display_rank, [], @forecastObject, @aggregateObject)
				end
				@res={}
				if @query_results.empty? && offset.to_i > 0
					@res['page_limit_exceeded'] = true
				end
				@res['result']=@query_results
				@res['row_totals']=@row_totals
				@res['column_totals']=@column_totals
				@res['grand_totals']=@grandTotals
				@query_results=@res
			end			
			return [] unless @query_results
			@results =  @query_results.class==Array ? @query_results : @query_results['result']	

			# if @get_total
			# 	@total = cibids.get_total(table_name, @conditionsMap)
			# end
			# if @sec_conditions && !@sec_conditions.to_s.empty?
			if @sec_conditions && @sec_conditionsMap.length > 0					
				@sec_conditionsMap = @sec_conditionsMap.empty? ? nil : @sec_conditionsMap
				@sec_results = cibids.get_data(self.data_source, table_name, @dimensionsMap, @factMap, @sortMap, @sort_order, @limit, offset, @sec_conditionsMap, @display_rank, @selectionMap)
			end
			
		end
		
		unless @results
			return [] 
		end		
		
		if self.chart.chart_type.to_i == 7
			@total = cibids.get_total(table_name)
			mes_keys = self.chart.measures.map{|mes| mes.field_name}
			@results = format_table_data(@results,mes_keys)
						
			return {:recordsTotal => @total, :recordsFiltered => @total, :data => @results }
		end
		# self.format_results(@factMap, @dimensionsMap)
		@query_results 

    end

    def format_table_data(results,mes_keys)    	
    	result_arr = []
    	results.each do |res|
    		arr = []
    		mes_keys.each do |key|
    			arr.push(res[key])
    		end
    		result_arr << arr
    	end
    	result_arr
    	# results.map{|result| result.values}
    end

    def generate_row_map
    	@dimensionsMap=[]
    	@rowSortMap = []
    	self.chart.dimensions.each do |dimension|
    		if dimension.is_row
				@dimensionsMap << dimension.get_dimension_map_entry
				if dimension.sort_order && !dimension.sort_order.blank?
					@rowSortMap << {
						"fieldName" => dimension.field_name, 
						"formatAs" => dimension.format_as ? dimension.format_as : "", 
						"sortOrder" => dimension.sort_order,
						"displayName" => dimension.display_name
					}
				end
			end
		end
		self.chart.measures.each do |measure|
			if measure.sort_order && !measure.sort_order.blank?
				@rowSortMap << {
					"fieldName" => measure.field_name, 
					"formatAs" => measure.format_as ? measure.format_as : "", 
					"sortOrder" => measure.sort_order,
					"displayName" => measure.display_name
				}
			end
		end
    end

    def generate_column_map
    	@dimensionsMap=[]
    	@columnSortMap = []
    	self.chart.dimensions.each do |dimension|
    		if !dimension.is_row
				@dimensionsMap << dimension.get_dimension_map_entry
				if dimension.sort_order && !dimension.sort_order.blank?
					@columnSortMap << {
						"fieldName" => dimension.field_name, 
						"formatAs" => dimension.format_as ? dimension.format_as : "", 
						"sortOrder" => dimension.sort_order,
						"displayName" => dimension.display_name
					}
				end
			end
		end
		self.chart.measures.each do |measure|
			if measure.sort_order && !measure.sort_order.blank?
				@columnSortMap << {
					"fieldName" => measure.field_name, 
					"formatAs" => measure.format_as ? measure.format_as : "", 
					"sortOrder" => measure.sort_order,
					"displayName" => measure.display_name
				}
			end
		end
    end

	def generate_dimensions_map
		self.chart.dimensions.each do |dimension|
			@dimensionsMap << dimension.get_dimension_map_entry
		end  	
	end

	def generate_forecast_object
		configObj=JSON.parse(self.chart.configs || "{}")	
		forecastObj=configObj["forecastObject"] || {}
		if forecastObj["enableForecast"]
			@forecastObject=forecastObj
		else
			@forecastObject=nil
		end
		@forecastObject
	end

	def generate_aggregate_map
		if self.chart.highlight_rule
			@aggregateObject = self.chart.highlight_rule.get_aggregate_object 
		else
			@aggregateObject = []
		end
	end

	def generate_fact_map
		self.chart.measures.each do |measure|
			@sec_conditionsMap = @conditionsMap;
			case measure.format_as
			when "opspc"
				fact_format = "count"
				@sec_conditionsMap.push({"fieldName" => measure.field_name, "formatAs" => "", "displayName" => measure.display_name, "dataType" => "string",
							 "comparision" => "IS NOT NULL","value" => nil})
				# @sec_conditionsMap.push({"fieldName" => self.fact, "formatAs" => "","dataType" => "string",
				# 			 "comparision" => "!=","value" => "-"})
				@sec_conditions = true
				@sec_operation = '%'
			when "noopspc"
				fact_format = "count"
				@sec_conditionsMap.push({"fieldName" => measure.field_name, "formatAs" => "", "displayName" => measure.display_name, "dataType" => "string",
							 "comparision" => "IN","value" => [nil,'-']})
				@sec_conditions = true
				@sec_operation = '%'
			when "noops"
				fact_format = "count"
				@sec_conditionsMap.push({"fieldName" => measure.field_name, "formatAs" => "", "displayName" => measure.display_name, "dataType" => "string",
							 "comparision" => "IN","value" => [nil,'-']})			
			when "per_change_sum"
				fact_format = "sum"	
				r_aggregate_key = "per_change_sum"	
			when "per_change_count"
				fact_format = "count"
				r_aggregate_key = "per_change_count"		
			else
				fact_format = measure.format_as
			end	
			@factMap << {"fieldName" => measure.field_name, "formatAs" => fact_format, "displayName" => measure.display_name, "rAggregateKey" => r_aggregate_key}			
			# @factMap << measure.get_fact_map_entry
		end  	
		if self.chart.chart_type.to_i == 4 || self.chart.chart_type.to_i == 16 || self.chart.chart_type.to_i == 19
			lat_lon_fields = self.data_source.get_lat_lon_fields

			@factMap.push(
					{"fieldName" => lat_lon_fields["lat"], "formatAs" => ""},
					{"fieldName" => lat_lon_fields["lon"], "formatAs" => ""},
				)
		end	
		@factMap	
	end

	def generate_conditions_map
		@conditionsMap = @conditionsMap || []

		if self.chart.active_chart_filters
			self.chart.active_chart_filters.each do |cf|
				@conditionsMap.concat(cf.get_condition)
				# @conditionsMap << cf.get_condition
			end
		end

		if self.chart.dashboard && self.chart.dashboard.active_dashboard_filters
			unless self.chart.isolated
				self.chart.dashboard.active_dashboard_filters.each do |df|
					#if self.data_source.fields.include?(df.field_name)
						@conditionsMap.concat(df.get_condition)
					#end
				end
			end
		end		

		current_user = User.current_user
		if current_user
			@conditionsMap.concat(current_user.get_user_filters(self.data_source_id))
		end


		if @filters
			@filters.each do |f|
				unless self.chart.isolated
			 		if self.data_source.fields.include?(f['dimension'])
		 				formatAs = f['formatAs'] || ''
		 				# case f["operator"]
		 				# when "="
		 				# 	if f["value"].class==Array
		 				# 		operator = "IN"
		 				# 	else
		 				# 		operator = "="
		 				# 	end
		 				# when "!="
		 				# 	if f["value"].class==Array
		 				# 		operator = "NOT IN"
		 				# 	else
		 				# 		operator = "!="
		 				# 	end		 						
		 				# end
		 			
		 				if self.chart.chart_type == 15 && self.chart.dimensions[0] && f['dimension'] == self.chart.dimensions[0].field_name
		 					value = f['value'].class == Array ? f['value'][0] : f['value']
				 			if f["operator"] == "IN"	
					 			@conditionsMap <<
					 				{"fieldName" => f['dimension'], "formatAs" => formatAs,"dataType" => "string",
					 				"comparision" => "<=","value" => value}
					 		end
		 				else
		 					value = f['value']
		 					# if self.chart.chart_type == 14 
			 				# 	if formatAs == "Month"
			 				# 		value = value.map do |val|
			 				# 			Date::ABBR_MONTHNAMES.index(val)
			 				# 		end
			 				# 	elsif formatAs == "Month Year"
			 				# 		value = value.map do |v|
						 	# 			val = v.split(' ')
						 	# 			"#{val[0]} "+("%02d" % Date::ABBR_MONTHNAMES.index(val[1]))				
						 	# 		end
			 				# 	end
			 				# end
		 					@conditionsMap <<
		 		    	   		{"fieldName" => f['dimension'], "formatAs" => formatAs,"dataType" => "string",
					 			"comparision" => f["operator"],"value" => value}				 
						end					
					end
				end	
			end		
		end

		# if self.chart.chart_type == 15 			
		# 	if self.chart.dimensions.length == 1
		# 		dimension=self.chart.dimensions[0]
		# 		formatAs=dimension['format_as']
		# 		if formatAs != "Month, Year"
		# 			@conditionsMap <<
		# 				{"fieldName" => dimension['field_name'],"formatAs" =>formatAs,"dataType" => "string",
		# 				"comparision" => "IN","value" => ["#{formatAs}(CURDATE())","#{formatAs}(CURDATE())-1"]}
		# 		end
		# 	end
		# end	
		@conditionsMap = @conditionsMap.empty? ? nil : @conditionsMap
	end

	def generate_sort_map
		self.chart.dimensions.each do |dimension|
			if dimension.sort_order && !dimension.sort_order.blank?
				@sortMap << {
					"fieldName" => dimension.field_name, 
					"formatAs" => dimension.format_as ? dimension.format_as : "", 
					"sortOrder" => dimension.sort_order,
					"displayName" => dimension.display_name
				}
			end
		end 
		self.chart.measures.each do |measure|
			if measure.sort_order && !measure.sort_order.blank?
				@sortMap << {
					"fieldName" => measure.field_name, 
					"formatAs" => measure.format_as ? measure.format_as : "", 
					"sortOrder" => measure.sort_order,
					"displayName" => measure.display_name
				}
			end
		end 		
	end

  	def format_results(factMap, dimensionsMap)
		@results = @results.each do |result|
			if @sec_conditions && @sec_results
				sec_result = @sec_results.find do |sr| 
					found = true
					dimensionsMap.each do |dimension|
						field = dimension["fieldName"]
						found = found && sr[field] == result[field]
					end
					found
				end
			end			
			factMap.each do |fact|		

				
				fact_str = self.get_fact_str(fact) # "#{fact["formatAs"]}(`#{fact["fieldName"]}`)"
				val = result[fact_str].to_f					
				if @sec_operation == '%'
					if sec_result
						sec_val = sec_result[fact_str].to_f					
					else
						sec_val = 0
					end	
					val = sec_val * 100.0 / val				
				end			

				unless(fact["fieldName"] == self.dimension_name || fact["fieldName"] == self.depth)
					format_as_key = fact["formatAs"] == "" ? "noformat" : fact["formatAs"]
					result["#{fact["fieldName"]}"] = {} unless result["#{fact["fieldName"]}"] && format_as_key != "noformat"
					# result["#{fact["fieldName"]}"][format_as_key] = {} unless result["#{fact["fieldName"]}"][format_as_key]
					result["#{fact["displayName"]}"] = val.to_s
				end								
			end			
		end		
		@results
	end

	def generate_preview_objects(preview_data, data_source_id, chart_type)		
		preview_data = JSON.parse(preview_data)
		chart = self.build_chart(:chart_type => chart_type)
		self.count = preview_data["count"]
		self.data_source_id = data_source_id
		chart.dimensions.build(preview_data["dimensions"])
		chart.measures.build(preview_data["measures"])
	end

	protected
	def get_fact_str_old(fact)
		"#{fact["formatAs"]}(`#{fact["fieldName"]}`)"
	end


	def get_fact_str(fact)
		fact_format_as = fact["formatAs"] 
		fact_field_name = fact["fieldName"]
		if fact_field_name.match(/[\[\]]/)
			fact_field_name = fact_field_name.gsub(/[\[\]]/, '`')
		else
			fact_field_name = fact_format_as == "" ? "#{fact_field_name}" : "`#{fact_field_name}`"
		end	
		if fact_format_as.include?(',')
			formats = fact_format_as.split(',')
		end	
		(fact_format_as.empty? || fact_format_as.nil?) ? fact_field_name : (formats ? "#{formats[0]}(#{formats[1]}(#{fact_field_name}))" : "#{fact_format_as}(#{fact_field_name})" )
		# "#{fact_format_as}(#{fact_field_name})"
	end
end
