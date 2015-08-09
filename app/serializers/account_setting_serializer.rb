class AccountSettingSerializer < ActiveModel::Serializer
	embed :ids
	attributes :id, :timezone, :number_format, :currency, :fiscal_year_start_day, 
			   :fiscal_year_start_month, :account_id,
			   :top_bar_color, :workspace_color, :dashboard_bar_color, :company_logo, 
			   :company_new_logo, :logo_width, :collapse_navbar

	has_one :account 
end