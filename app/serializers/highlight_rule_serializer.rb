class HighlightRuleSerializer < ActiveModel::Serializer
	embed :ids
	attributes :id, :chart_id, :comparison_function, :operator, :comparison_value, 
				:configs, :enable_highlight, :enable_sem
end