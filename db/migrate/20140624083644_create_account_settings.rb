class CreateAccountSettings < ActiveRecord::Migration
  def change
    create_table :account_settings do |t|
   	  t.integer :account_id 
   	  t.string :timezone
   	  t.string :number_format
   	  t.string :currency
   	  t.integer :fiscal_year_start_day
   	  t.integer :fiscal_year_start_month
      t.timestamps
    end
  end
end
