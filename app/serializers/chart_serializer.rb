class ChartSerializer < ActiveModel::Serializer
  embed :ids
  attributes :id, :chart_type, :css_class_name, :configs, :width, :height, :modal_enabled,
  			 :modal_title, :margin_bottom, :margin_right, :margin_left, :margin_top,
  			 :secondary_dimension, :dashboard_id, :title, :subtitle, :sort_by_key, :desc_order,
  			 :orientation_type, :drill_through_fields, :excluded_rows, :axes_configs, :rows, :columns,
         :display_rank, :created_at, :updated_at, :updated_by, :account_template_id, :isolated, :description, :chart_alert_emails

  has_many   :comments
  has_many   :charts_data_sources
  has_many   :data_sources

  has_many	 :chart_filters

  has_many	 :dimensions
  has_many	 :measures
  has_one    :highlight_rule
end
