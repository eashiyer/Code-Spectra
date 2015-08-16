class Measure < AuditedModel
  attr_accessible :chart_id, :display_name, :field_name, :format_as, :is_calculated, :prefix, 
  					:sort_order, :suffix, :unit, :account_template_id

  belongs_to :chart
  belongs_to :account_template
  validates :field_name, :presence => true
  
  
  	def get_fact_map_entry
		return {
			"fieldName" => self.field_name,
			"formatAs" => self.format_as,
			"displayName" => self.display_name,
		}
  	end 
end
