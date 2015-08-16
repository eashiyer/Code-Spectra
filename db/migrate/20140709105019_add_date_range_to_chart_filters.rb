class AddDateRangeToChartFilters < ActiveRecord::Migration
  def change
    add_column :chart_filters, :field_data_type, :string
    add_column :chart_filters, :date_range, :boolean
    add_column :chart_filters, :upper_range, :date
    add_column :chart_filters, :lower_range, :date
    add_column :chart_filters, :reference_direction, :string
    add_column :chart_filters, :reference_count, :integer
    add_column :chart_filters, :reference_unit, :string
    add_column :chart_filters, :reference_date_today, :boolean
    add_column :chart_filters, :reference_date, :date
    add_column :chart_filters, :display_name, :string
  end
end
