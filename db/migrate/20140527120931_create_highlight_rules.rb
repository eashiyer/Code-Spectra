class CreateHighlightRules < ActiveRecord::Migration
  def change
    create_table :highlight_rules do |t|
      t.timestamps
      t.string :comparison_function
      t.string :operator
      t.float :comparison_value
      t.string :configs
      t.integer :chart_id
    end
  end
end
