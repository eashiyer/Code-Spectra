class Rule < ActiveRecord::Base
  belongs_to :data_sources
  attr_accessible :data_source_id, :rule_type, :rule_input, :rule_output
end
