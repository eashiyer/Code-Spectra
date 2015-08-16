class AddAxesConfigsToCharts < ActiveRecord::Migration
  def change
    add_column :charts, :axes_configs, :string
  end
end
