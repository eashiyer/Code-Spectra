class AddEnableHighlightToHighlightRules < ActiveRecord::Migration
  def change
    add_column :highlight_rules, :enable_highlight, :boolean, :default => false
  end
end
