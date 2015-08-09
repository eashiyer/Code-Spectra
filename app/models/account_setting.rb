class AccountSetting < AuditedModel
  # attr_accessible :title, :body
  attr_accessible :company_logo, :timezone, :number_format, :currency, 
  				  :fiscal_year_start_day, :fiscal_year_start_month, :account_id,
  				  :top_bar_color, :workspace_color, :dashboard_bar_color, :logo_width,
            :collapse_navbar
  has_attached_file :company_logo, :styles => { :medium => "300x300>", :thumb => "100x100>" }, :default_url => "/assets/logo_short.png"
  validates_attachment_content_type :company_logo, :content_type => /\Aimage\/.*\Z/ 
  
  
  validates :account_id, :uniqueness => true

  belongs_to :account
  #has_many :users

  def company_new_logo

  end
end
