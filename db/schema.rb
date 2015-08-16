# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20141014123920) do

  create_table "account_settings", :force => true do |t|
    t.integer  "account_id"
    t.string   "timezone"
    t.string   "number_format"
    t.string   "currency"
    t.integer  "fiscal_year_start_day"
    t.integer  "fiscal_year_start_month"
    t.datetime "created_at",                                       :null => false
    t.datetime "updated_at",                                       :null => false
    t.string   "company_logo_file_name"
    t.string   "company_logo_content_type"
    t.integer  "company_logo_file_size"
    t.datetime "company_logo_updated_at"
    t.string   "top_bar_color",             :default => "#FFFFFF"
    t.string   "workspace_color",           :default => "#323232"
    t.string   "dashboard_bar_color",       :default => "#323232"
    t.integer  "logo_width"
    t.boolean  "collapse_navbar",           :default => false
    t.boolean  "sso_enabled",               :default => false
    t.string   "authentication_url"
  end

  create_table "account_templates", :force => true do |t|
    t.integer  "account_id"
    t.string   "template_name"
    t.string   "template_inputs"
    t.integer  "status"
    t.datetime "created_at",      :null => false
    t.datetime "updated_at",      :null => false
  end

  create_table "accounts", :force => true do |t|
    t.datetime "created_at",                               :null => false
    t.datetime "updated_at",                               :null => false
    t.string   "name"
    t.string   "account_type",        :default => "trial"
    t.integer  "admin_users_limit"
    t.integer  "manager_users_limit"
    t.integer  "basic_users_limit"
    t.integer  "data_sources_limit"
    t.integer  "verticals_limit"
    t.datetime "time_limit"
  end

  create_table "active_admin_comments", :force => true do |t|
    t.string   "resource_id",   :null => false
    t.string   "resource_type", :null => false
    t.integer  "author_id"
    t.string   "author_type"
    t.text     "body"
    t.datetime "created_at",    :null => false
    t.datetime "updated_at",    :null => false
    t.string   "namespace"
  end

  add_index "active_admin_comments", ["author_type", "author_id"], :name => "index_active_admin_comments_on_author_type_and_author_id"
  add_index "active_admin_comments", ["namespace"], :name => "index_active_admin_comments_on_namespace"
  add_index "active_admin_comments", ["resource_type", "resource_id"], :name => "index_admin_notes_on_resource_type_and_resource_id"

  create_table "admin_users", :force => true do |t|
    t.string   "email",                  :default => "", :null => false
    t.string   "encrypted_password",     :default => "", :null => false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          :default => 0
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.datetime "created_at",                             :null => false
    t.datetime "updated_at",                             :null => false
  end

  add_index "admin_users", ["email"], :name => "index_admin_users_on_email", :unique => true
  add_index "admin_users", ["reset_password_token"], :name => "index_admin_users_on_reset_password_token", :unique => true

  create_table "auth_servers", :force => true do |t|
    t.datetime "created_at",      :null => false
    t.datetime "updated_at",      :null => false
    t.string   "client_id"
    t.string   "auth_server_url"
    t.integer  "account_id"
    t.string   "client_name"
  end

  create_table "chart_filters", :force => true do |t|
    t.datetime "created_at",                              :null => false
    t.datetime "updated_at",                              :null => false
    t.string   "field_name"
    t.integer  "comparison_operator"
    t.string   "field_values"
    t.boolean  "exclude"
    t.integer  "chart_id"
    t.string   "format_as"
    t.boolean  "disabled",             :default => false
    t.string   "field_data_type"
    t.boolean  "date_range"
    t.datetime "upper_range"
    t.datetime "lower_range"
    t.string   "reference_direction"
    t.integer  "reference_count"
    t.string   "reference_unit"
    t.boolean  "reference_date_today"
    t.datetime "reference_date"
    t.string   "display_name"
  end

  create_table "charts", :force => true do |t|
    t.datetime "created_at",                                  :null => false
    t.datetime "updated_at",                                  :null => false
    t.integer  "dashboard_id",                                :null => false
    t.integer  "chart_type",                                  :null => false
    t.text     "configs"
    t.string   "secondary_dimension"
    t.string   "title"
    t.string   "subtitle"
    t.string   "css_class_name",       :default => "span"
    t.integer  "width",                :default => 600
    t.integer  "height",               :default => 400
    t.integer  "margin_top",           :default => 60
    t.integer  "margin_left",          :default => 60
    t.integer  "margin_right",         :default => 60
    t.integer  "margin_bottom",        :default => 60
    t.boolean  "modal_enabled",        :default => false
    t.string   "modal_title",          :default => "Summary"
    t.boolean  "is_hidden",            :default => false
    t.integer  "display_rank",         :default => 0
    t.string   "sort_by_key"
    t.boolean  "desc_order",           :default => false
    t.integer  "orientation_type",     :default => 1
    t.text     "axes_configs"
    t.string   "drill_through_fields"
    t.string   "excluded_rows"
    t.integer  "rows",                 :default => 1
    t.integer  "columns",              :default => 1
    t.string   "updated_by"
    t.integer  "account_template_id"
    t.boolean  "isolated",             :default => false
    t.text     "description"
  end

  create_table "charts_data_sources", :force => true do |t|
    t.datetime "created_at",                             :null => false
    t.datetime "updated_at",                             :null => false
    t.integer  "chart_id"
    t.integer  "data_source_id"
    t.integer  "count"
    t.string   "dimension_name"
    t.string   "dimension_format_as"
    t.string   "depth"
    t.string   "fact"
    t.string   "fact_type"
    t.string   "fact_unit",           :default => "Rs"
    t.string   "fact_format",         :default => "sum"
    t.boolean  "is_calculated",       :default => false
    t.string   "fact_display"
    t.string   "query_str"
    t.boolean  "row_query_mode"
    t.integer  "account_template_id"
    t.boolean  "isolated",            :default => false
  end

  create_table "charts_users", :force => true do |t|
    t.datetime "created_at",                  :null => false
    t.datetime "updated_at",                  :null => false
    t.integer  "chart_id"
    t.integer  "user_id"
    t.integer  "width",      :default => 400
    t.integer  "height",     :default => 250
  end

  create_table "comments", :force => true do |t|
    t.datetime "created_at",                 :null => false
    t.datetime "updated_at",                 :null => false
    t.text     "message"
    t.string   "author_name"
    t.integer  "author_id"
    t.integer  "status",      :default => 0
    t.integer  "chart_id"
  end

  add_index "comments", ["author_id"], :name => "index_comments_on_author_id"
  add_index "comments", ["status"], :name => "index_comments_on_status"

  create_table "dashboard_filters", :force => true do |t|
    t.string   "field_name"
    t.string   "field_data_type"
    t.integer  "comparison_operator"
    t.text     "field_values"
    t.integer  "dashboard_id"
    t.datetime "created_at",                              :null => false
    t.datetime "updated_at",                              :null => false
    t.string   "format_as"
    t.boolean  "disabled",             :default => false
    t.boolean  "date_range"
    t.datetime "upper_range"
    t.datetime "lower_range"
    t.string   "reference_direction"
    t.integer  "reference_count"
    t.string   "reference_unit"
    t.boolean  "reference_date_today"
    t.datetime "reference_date"
    t.string   "display_name"
    t.boolean  "is_global",            :default => false
    t.integer  "user_id"
    t.string   "predefined_range"
  end

  create_table "dashboards", :force => true do |t|
    t.datetime "created_at",                             :null => false
    t.datetime "updated_at",                             :null => false
    t.string   "title"
    t.string   "subtitle"
    t.integer  "display_rank"
    t.string   "display_name"
    t.integer  "vertical_id"
    t.integer  "rows",                :default => 2
    t.integer  "columns",             :default => 2
    t.boolean  "auto_refresh",        :default => false
    t.integer  "refresh_interval"
    t.integer  "account_template_id"
    t.boolean  "has_publicaccess",    :default => false
  end

  create_table "data_connections", :force => true do |t|
    t.datetime "created_at",       :null => false
    t.datetime "updated_at",       :null => false
    t.string   "display_name"
    t.string   "host",             :null => false
    t.string   "dbname"
    t.string   "username"
    t.string   "password"
    t.string   "port"
    t.string   "socket"
    t.boolean  "use_ssl"
    t.integer  "query_duration"
    t.string   "connection_type"
    t.integer  "account_id"
    t.string   "service_name"
    t.string   "data_server_name"
  end

  create_table "data_contents", :force => true do |t|
    t.datetime "created_at",                         :null => false
    t.datetime "updated_at",                         :null => false
    t.string   "filename"
    t.string   "format"
    t.text     "content",        :limit => 16777215
    t.string   "tag"
    t.integer  "data_source_id"
    t.float    "size"
  end

  create_table "data_sources", :force => true do |t|
    t.datetime "created_at",                             :null => false
    t.datetime "updated_at",                             :null => false
    t.string   "name"
    t.text     "dimensions_str"
    t.text     "groups_str"
    t.text     "fields_str"
    t.integer  "load_count"
    t.boolean  "enabled"
    t.string   "data_source_type",    :default => "csv"
    t.integer  "account_id",          :default => 1
    t.boolean  "data_types_updated",  :default => false
    t.string   "index_str"
    t.string   "unique_str"
    t.integer  "file_upload_state"
    t.string   "sheets_array"
    t.string   "ignored_str"
    t.text     "preview_data"
    t.integer  "account_template_id"
  end

  add_index "data_sources", ["name"], :name => "index_data_sources_on_name"

  create_table "dimensions", :force => true do |t|
    t.string   "field_name"
    t.string   "format_as"
    t.string   "display_name"
    t.integer  "rank"
    t.string   "sort_order"
    t.integer  "chart_id"
    t.datetime "created_at",                             :null => false
    t.datetime "updated_at",                             :null => false
    t.boolean  "is_row",              :default => false
    t.integer  "account_template_id"
  end

  create_table "highlight_rules", :force => true do |t|
    t.datetime "created_at",                             :null => false
    t.datetime "updated_at",                             :null => false
    t.string   "comparison_function"
    t.string   "operator"
    t.float    "comparison_value"
    t.string   "configs"
    t.integer  "chart_id"
    t.boolean  "enable_highlight",    :default => false
    t.boolean  "enable_sem",          :default => false
    t.boolean  "is_value"
    t.boolean  "is_calculated"
  end

  create_table "measures", :force => true do |t|
    t.string   "field_name"
    t.string   "format_as"
    t.string   "display_name"
    t.string   "sort_order"
    t.integer  "chart_id"
    t.boolean  "is_calculated"
    t.string   "prefix"
    t.string   "suffix"
    t.string   "unit"
    t.datetime "created_at",          :null => false
    t.datetime "updated_at",          :null => false
    t.integer  "account_template_id"
  end

  create_table "permissions", :force => true do |t|
    t.datetime "created_at",       :null => false
    t.datetime "updated_at",       :null => false
    t.integer  "user_id"
    t.integer  "permissible_id"
    t.string   "permissible_type"
    t.string   "role"
  end

  create_table "query_data_sources", :force => true do |t|
    t.datetime "created_at",                                     :null => false
    t.datetime "updated_at",                                     :null => false
    t.text     "query"
    t.integer  "frequency"
    t.integer  "data_connection_id"
    t.integer  "data_source_id"
    t.datetime "last_run_at"
    t.boolean  "enabled",                      :default => true
    t.integer  "import_type"
    t.string   "bookmark_key"
    t.string   "bookmark_comparison_operator"
    t.boolean  "last_run_successful"
    t.string   "last_run_status"
  end

  create_table "rules", :force => true do |t|
    t.datetime "created_at",     :null => false
    t.datetime "updated_at",     :null => false
    t.integer  "data_source_id"
    t.integer  "rule_type"
    t.text     "rule_input"
    t.string   "rule_output"
  end

  create_table "scheduled_reports", :force => true do |t|
    t.integer  "user_id"
    t.integer  "dashboard_id"
    t.integer  "days"
    t.string   "time"
    t.string   "emails"
    t.datetime "last_sent_at"
    t.boolean  "is_scheduled"
    t.datetime "created_at",   :null => false
    t.datetime "updated_at",   :null => false
  end

  create_table "spree_data_sources", :force => true do |t|
    t.string   "store_name"
    t.string   "store_url"
    t.string   "api_token"
    t.integer  "frequency_of_import"
    t.integer  "data_source_id"
    t.datetime "last_run_at"
    t.boolean  "last_run_successful"
    t.string   "last_run_status"
    t.string   "import_type"
    t.datetime "created_at",                            :null => false
    t.datetime "updated_at",                            :null => false
    t.boolean  "enabled",             :default => true
  end

  create_table "user_color_preferences", :force => true do |t|
    t.datetime "created_at",            :null => false
    t.datetime "updated_at",            :null => false
    t.integer  "color_theme"
    t.string   "bar"
    t.string   "line"
    t.string   "area"
    t.string   "error_bar"
    t.string   "control_key"
    t.string   "statistical_relevance"
    t.integer  "user_id"
  end

  create_table "user_filters", :force => true do |t|
    t.datetime "created_at",                             :null => false
    t.datetime "updated_at",                             :null => false
    t.string   "field_name"
    t.string   "display_name"
    t.string   "format_as"
    t.integer  "comparison_operator"
    t.text     "field_values"
    t.boolean  "disabled",            :default => false
    t.boolean  "hide",                :default => false
    t.integer  "user_id"
    t.integer  "data_source_id"
  end

  create_table "users", :force => true do |t|
    t.string   "email",                  :default => "",    :null => false
    t.string   "encrypted_password",     :default => "",    :null => false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          :default => 0
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.string   "authentication_token"
    t.datetime "created_at",                                :null => false
    t.datetime "updated_at",                                :null => false
    t.string   "first_name"
    t.string   "last_name"
    t.boolean  "is_admin",               :default => false
    t.integer  "account_id",             :default => 1
    t.string   "confirmation_token"
    t.datetime "confirmation_sent_at"
    t.datetime "confirmed_at"
    t.string   "unconfirmed_email"
    t.boolean  "has_api_access",         :default => false
    t.string   "api_access_token"
  end

  add_index "users", ["email"], :name => "index_users_on_email", :unique => true
  add_index "users", ["reset_password_token"], :name => "index_users_on_reset_password_token", :unique => true

  create_table "versions", :force => true do |t|
    t.string   "item_type",      :null => false
    t.integer  "item_id",        :null => false
    t.string   "event",          :null => false
    t.string   "whodunnit"
    t.text     "object"
    t.datetime "created_at"
    t.string   "object_changes"
  end

  add_index "versions", ["item_type", "item_id"], :name => "index_versions_on_item_type_and_item_id"

  create_table "verticals", :force => true do |t|
    t.datetime "created_at",                                  :null => false
    t.datetime "updated_at",                                  :null => false
    t.string   "name"
    t.boolean  "is_hidden",                :default => false
    t.integer  "account_id",               :default => 1
    t.integer  "account_template_id"
    t.text     "description"
    t.string   "icon_type"
    t.string   "custom_icon_file_name"
    t.string   "custom_icon_content_type"
    t.integer  "custom_icon_file_size"
    t.datetime "custom_icon_updated_at"
  end

end
