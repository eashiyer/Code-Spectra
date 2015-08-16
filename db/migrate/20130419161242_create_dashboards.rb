class CreateDashboards < ActiveRecord::Migration
  def up
    create_table :dashboards do |t|
      t.timestamps
      t.string  :title
      t.string  :subtitle
      t.integer :display_rank
      t.string  :display_name
      t.integer :vertical_id 
    end
	# No indices cz we dont expect too many dashboards to be created    
  end

  def down
  	drop_table :dashboards
  end
end
