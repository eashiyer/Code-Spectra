require 'digest/md5'
class User < AuditedModel
  # Include default devise modules. Others available are:
  # :token_authenticatable, :confirmable,
  # :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable, :token_authenticatable, :confirmable
  # attr_accessible :title, :body

  attr_accessible :email, :password, :password_confirmation, 
  				  :remember_me, :first_name, :last_name,
  				  :is_admin, :user_permissions, :account_id,
            :user_color_preference_id, :confirmation_token, :confirmation_sent_at, 
            :confirmed_at, :unhashed_password, :has_api_access, :authentication_token, :api_access_token, :account

  belongs_to :account
  has_many :permissions, :dependent => :destroy
  has_many :charts_users, :dependent => :destroy
  has_many :user_filters, :dependent => :destroy  
  has_one :user_color_preference, :dependent => :destroy 
  has_many :scheduled_reports

  validates_uniqueness_of :email, :case_sensitive => false
  validates_presence_of :account

  before_create :check_limit, :generate_api_access_token

  def generate_api_access_token
    if self.has_api_access
      self.api_access_token = Digest::MD5.hexdigest(Time.now.to_s)
    else
      self.api_access_token = nil
    end
  end

  def company_logo_url
    if self.account.account_setting
        self.account.account_setting.company_logo.url(:medium)
    end
  end

  def logo_width
        self.account.account_setting.logo_width
  end

  def color_palette
    hash = {}
    if self.account.account_setting
      #get topBarColor
      hash['topBarColor'] = self.account.account_setting.top_bar_color

      #get dashboardBarColor
      hash['dashboardBarColor'] = self.account.account_setting.dashboard_bar_color

      #get workspaceColor
      hash['workspaceColor'] = self.account.account_setting.workspace_color
    end
    hash.to_json
  end

  def user_permissions
    # Should only be able to get own user_permissions
    @user_permissions ||= self.create_and_get_user_permissions
    @user_permissions.to_json
  end

  def has_authorization?(permissible_type, permissible_ids, action)
    has_authorization = false

    permissible_ids = [permissible_ids] unless permissible_ids.kind_of?(Array)
    # We have to find the relevant permission object, & check role of current user for the relevant entity
    permissible = eval(permissible_type).send("find", permissible_ids[0])

    

    case permissible_type      
    when "Vertical"
      type = "Vertical"
      vertical = permissible

      account = vertical.account      
    when "Dashboard"
      type = "Dashboard"
      vertical = permissible.vertical
      dashboard = permissible

      account = vertical.account
    # when "Chart"
    #   dashboard = permissible.dashboard
    #   vertical = dashboard.vertical

    #   account = vertical.account
    # when "DataSource"
    #   account = permissible.account
    else
      # do nothing
    end
    
    # Return false if trying to access another's account!
    if account.id != self.account.id
      return false
    end

    # For same account, admin can do everything!
    return self.is_admin? if self.is_admin?

    authorization = self.get_authorization_for_entity(type, permissible.id)
    unless authorization
      return false
    end
    has_authorization = Permission::role_can_perform?(authorization[:role], action)

    # Return has_authorization
    Rails.logger.info "User #{self.id} called #{permissible_type}::#{action}/#{permissible_ids}. Has Authorization=#{has_authorization}"
    has_authorization
  end

  def verticals
    verticals = []
    return self.account.verticals.all(:conditions => ['is_hidden = false']) if self.is_admin?
    
    verticals = self.permissions.map do |permission|
      if permission.permissible_type == "Vertical"
        permission.permissible
      elsif permission.permissible_type == "Dashboard"
        permission.permissible.vertical
      end
    end
    verticals.uniq!
    verticals 
  end

  # User Permissions Method
  # Returns a map of user permissions and entities
  # Return Format
  # {
  #   "Vertical" => [{
  #       permissible_id => 1, permissible => <#Object>, role => "admin"
  #     }],
  #   "Dashboard" => [{
  #       permissible_id => 2, permissible => <#Object>, role => "admin"
  #     }]
  # }
  def create_and_get_user_permissions
    # Get From Cache
    # If not found, Create & Save to Cache with 5minute expiry
    @user_permissions = @user_permissions || {"Vertical" => [], "Dashboard" => []}
    self.permissions.each do |permission|
      case permission.permissible_type
      when 'Vertical'
        self.add_to_permissions_map(permission)

        vertical = permission.permissible
        vertical.dashboards.each do |dashboard|
          self.add_to_permissions_map(permission, nil, "Dashboard", dashboard)  
        end
      when 'Dashboard'
        self.add_to_permissions_map(permission)
        vertical = permission.permissible.vertical
        self.add_to_permissions_map(permission, "basic", "Vertical", vertical)  
      else
        # Do Nothing
      end
    end
    @user_permissions
  end

  def add_to_permissions_map(permission, role = nil, permissible_type = nil, permissible = nil)
    permissible_type = permissible_type.nil? ? permission.permissible_type : permissible_type
    permissible = permissible.nil? ? permission.permissible : permissible
    return if permissible.nil?  # May be permissible was deleted
    role = role.nil? ? permission.role : role 
    authorization = self.get_authorization_for_entity(permissible_type, permissible.id)
    if authorization.nil?
      @user_permissions[permissible_type] <<  {
        :permissible_id => permissible.id,
        :role => role,
        :permissible => permissible
      }
    else
      role = Permission::preceding_role(authorization[:role], role)
      authorization[:role] = role
    end
  end

  def get_authorization_for_entity (type, id)
      if(!@user_permissions)
        self.create_and_get_user_permissions
      end
      return @user_permissions[type].find {|v| v[:permissible_id] == id}
  end

  def get_user_filters(data_source_id)
      conditions = []
      active_filters = self.user_filters.where("disabled = ? AND data_source_id = ?", false, data_source_id)
      active_filters.each do |filter|
          conditions.concat(filter.get_condition) 
      end
      conditions
  end

  def get_excluded_data_sources
      active_filters = self.user_filters.where("disabled = ? AND hide = ?", false, true )
      excluded_data_sources = active_filters.map {|f| f.data_source}.uniq
  end

  class << self
    def current_user=(user)
      Thread.current[:current_user] = user
    end

    def current_user
      Thread.current[:current_user]
    end
  end

  def check_limit
    if self.is_admin
      no_of_admin_users=User.where("is_admin = ? and account_id = ?",true,self.account_id).count
      if no_of_admin_users && self.account.admin_users_limit && no_of_admin_users<self.account.admin_users_limit
        return true
      else
        return false
      end
    else
      no_of_users=User.where("is_admin = ? and account_id = ?",false,self.account_id).count
      if no_of_users && self.account.basic_users_limit && no_of_users<self.account.basic_users_limit
        return true
      else
        return false
      end
    end
  end
end
