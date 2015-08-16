class CreateScheduledReports < ActiveRecord::Migration
  def change
    create_table :scheduled_reports do |t|
      t.integer :user_id
      t.integer :dashboard_id
      t.integer :days
      t.string :time
      t.string :emails
      t.datetime :last_sent_at
      t.boolean :is_scheduled

      t.timestamps
    end
  end
end
