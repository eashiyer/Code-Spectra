class DashboardSerializer < ActiveModel::Serializer
  embed :ids
  attributes :id, :display_name, :display_rank, :title, :subtitle, :rows, :columns, :auto_refresh, 
  			:refresh_interval, :updated_at, :account_template_id, :description

  has_many :charts
  has_many :dashboard_filters
  has_one  :vertical
end
