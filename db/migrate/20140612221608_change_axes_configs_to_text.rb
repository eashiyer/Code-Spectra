class ChangeAxesConfigsToText < ActiveRecord::Migration
  def up
	change_column :charts, :axes_configs, :text, :limit => 2.kilobytes
  end

  def down
  	change_column :charts, :axes_configs, :string
  end
end
