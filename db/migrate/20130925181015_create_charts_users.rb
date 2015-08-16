class CreateChartsUsers < ActiveRecord::Migration
  def change
    create_table :charts_users do |t|

    	t.timestamps
    	t.belongs_to :chart
    	t.belongs_to :user
    	t.integer :width, :default => 400
    	t.integer :height, :default => 250
    end
  end
end
