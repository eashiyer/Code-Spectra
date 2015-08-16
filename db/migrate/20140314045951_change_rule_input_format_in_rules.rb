class ChangeRuleInputFormatInRules < ActiveRecord::Migration
  def up
  	change_column :rules, :rule_input, :text
  end

  def down
  	change_column :rules, :rule_input, :string
  end
end
