# == Schema Information
#
# Table name: dashboards
#
#  id           :integer          not null, primary key
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  title        :string(255)
#  subtitle     :string(255)
#  display_rank :integer
#  display_name :string(255)
#  vertical_id  :integer
#

class Dashboard < AuditedModel
  attr_accessible :title, :subtitle, :display_name, :display_rank, 
                  :vertical_id, :chart_ids, :rows, :columns, :auto_refresh, 
                  :refresh_interval, :updated_at, :account_template_id, :scheduled_report,
                  :report_time, :description

  validates_presence_of :vertical_id
  belongs_to :vertical
  belongs_to :account_template
  has_many   :charts, dependent: :destroy, :order => :display_rank
  has_many 	 :permissions, :as => :permissible, :dependent => :destroy
  has_many   :dashboard_filters, dependent: :destroy
  
  
  def account
  	self.vertical.account
  end

  def users
  	users = []
  	implicit_users = self.vertical.permissions.map {|permission| permission.user}
  	explicit_users = self.permissions.map {|permission| permission.user}
  	account_admins = self.account.admins
  	users = implicit_users | explicit_users | account_admins
  end

  def active_dashboard_filters
    current_user = User.current_user
    self.dashboard_filters.where('disabled = ? && (is_global = ? || user_id = ?)', false, true, current_user.id)
  end

  def create_and_send_report
    
  end
end
