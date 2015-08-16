class ChangeDateToDatetime < ActiveRecord::Migration
  def up
  	change_column :chart_filters, :upper_range, :datetime
  	change_column :chart_filters, :lower_range, :datetime
  	change_column :chart_filters, :reference_date, :datetime
  	change_column :dashboard_filters, :upper_range, :datetime
  	change_column :dashboard_filters, :lower_range, :datetime
  	change_column :dashboard_filters, :reference_date, :datetime
  end

  def down
  	change_column :chart_filters, :upper_range, :date
  	change_column :chart_filters, :lower_range, :date
  	change_column :chart_filters, :reference_date, :date
  	change_column :dashboard_filters, :upper_range, :date
  	change_column :dashboard_filters, :lower_range, :date
  	change_column :dashboard_filters, :reference_date, :date
  end
end
