class HighlightRule < ActiveRecord::Base
  # attr_accessible :title, :body
  attr_accessible :comparison_function, :operator, :comparison_value, :configs, 
  					:chart_id, :enable_highlight, :enable_sem

  validates :chart_id, :presence => true

  belongs_to :chart

  	def get_aggregate_object
		rule=self
		aggregateMap = []
		fact_name=self.chart.measures.first.field_name
		if rule
			if rule.comparison_function == "P Value"
			aggregateMap << {"fieldName" => fact_name, "formatAs"=> "avg","dataType" => "string",							
							"displayName" => "Mean of #{fact_name}"}
			aggregateMap << {"fieldName" => fact_name, "formatAs"=> "count","dataType" => "string",
							"test" => JSON.parse(rule.configs)["test"], "control_field" => JSON.parse(rule.configs)["control_field"],
							"displayName" => "Count of #{fact_name}"}
			aggregateMap << {"fieldName" => fact_name, "formatAs"=> "stddev","dataType" => "string",
							"test" => JSON.parse(rule.configs)["test"], "control_field" => JSON.parse(rule.configs)["control_field"],
							"displayName" => "Stddev of #{fact_name}"}
			else
				aggregateMap=nil
			end
			@aggregateObject = {
				"test" => JSON.parse(rule.configs)["test"], "control_field" => JSON.parse(rule.configs)["control_field"],
				"comparison_function" => rule.comparison_function, "enable_sem" => rule.enable_sem, "aggregateMap" => aggregateMap
			}
		end		
		@aggregateObject
	end

end
