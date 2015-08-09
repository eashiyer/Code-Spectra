class ScheduledReportSerializer < ActiveModel::Serializer
  attributes :id, :dashboard_id, :time, :user_id, :is_scheduled, :last_sent_at, :emails, :days

end