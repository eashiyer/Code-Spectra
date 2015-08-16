class ChangeAccoutTypeDefaultValueToTrial < ActiveRecord::Migration
  def up
  	change_column :accounts , :account_type , :string , :default => "trial"
  end

  def down
  	change_column :accounts , :account_type , :string , :default => nil
  end
end
