class RuleSerializer < ActiveModel::Serializer
  embed :ids
  attributes :id, :data_source_id, :rule_type, :rule_input, :rule_output

end