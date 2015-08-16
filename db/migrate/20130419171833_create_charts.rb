class CreateCharts < ActiveRecord::Migration
  def up
    create_table :charts do |t|
      t.timestamps
      t.integer :dashboard_id,   :null => false
      
      # Data & Chart Configs
      t.integer :chart_type, 			 :null => false
      t.text 	:configs, :limit => 2.kilobytes
      t.string  :secondary_dimension

      t.string  :title 
      t.string  :subtitle 

      # CSS Properties
      t.string  :css_class_name, :default => "span"
      t.integer :width,     	 :default => 600
      t.integer :height,     	 :default => 400
      t.integer :margin_top,     :default => 60
      t.integer :margin_left,    :default => 60
      t.integer :margin_right,   :default => 60
      t.integer :margin_bottom,  :default => 60
      t.boolean :modal_enabled,  :default => false
      t.string  :modal_title,    :default => 'Summary'

    end
    # No Index because we dont expect too many charts per deployment
  end

  def down
  	drop_table :charts
  end
end
