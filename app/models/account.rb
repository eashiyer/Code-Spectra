class Account < AuditedModel
  attr_accessible :name, :account_type, :admin_users_limit, :basic_users_limit, :manager_users_limit, :data_sources_limit, 
  :verticals_limit, :time_limit, :account_setting_id
  has_many :users
  has_many :data_sources
  has_many :verticals
  has_many :data_connections
  has_many :account_templates
  has_one :account_setting
  
  
  validates_presence_of :name
  # validates_uniqueness_of :name  

  before_create :create_account_setting

  def create_account_setting
    self.build_account_setting(:account_id => self.id, :timezone => 'UTC', :currency => 'USD')
  end

  def admins
  	self.users.select {|u| u.is_admin? }
  end

  def self.create_account(params)
    created=true
    ActiveRecord::Base.transaction do 
      a = Account.new
      a.name = params[:data][:accountName]    
      a.admin_users_limit = 1   
      a.basic_users_limit = 5
      a.verticals_limit = 2
      a.data_sources_limit=10
      a.time_limit = 30.days.from_now.utc      
      # debugger      
      
      # a.users.build({'email'=> params[:data][:email], 'first_name' => params[:data][:firstName], 
      #   'last_name'=> params[:data][:lastName], 'is_admin'=> true, 
      #   'password' => "#{ params[:data][:firstName]}#{ params[:data][:lastName]}"})
      if a.save
        u=User.new
        u.account_id=a.id
        u.email=params[:data][:email]
        u.first_name= params[:data][:firstName]
        u.last_name=params[:data][:lastName]
        u.is_admin=true
        u.password="#{ params[:data][:firstName]}#{ params[:data][:lastName]}#{a.id}"
        unless u.save 
          created=false     
          raise ActiveRecord::Rollback
        end 
      end
    # raise ActiveRecord::Rollback         
    end
    created
  end

end