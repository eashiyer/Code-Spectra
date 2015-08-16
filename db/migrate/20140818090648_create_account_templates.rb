class CreateAccountTemplates < ActiveRecord::Migration
  def change
    create_table :account_templates do |t|
      t.integer :id
      t.integer :account_id
      t.string :template_name
      t.string :template_inputs
      t.integer :status

      t.timestamps
    end
  end
end
