class CreateRules < ActiveRecord::Migration
  def change
    create_table :rules do |t|
      t.timestamps
      t.integer :data_source_id
      t.integer :rule_type
      t.string  :rule_input
      t.string  :rule_output
    end
  end
end
