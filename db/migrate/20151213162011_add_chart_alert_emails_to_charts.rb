class AddChartAlertEmailsToCharts < ActiveRecord::Migration
  def change
    add_column :charts, :chart_alert_emails, :string
  end
end
