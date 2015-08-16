class AddEnableSemToHighlightRules < ActiveRecord::Migration
  def change
    add_column :highlight_rules, :enable_sem, :boolean, :default => false
  end
end
