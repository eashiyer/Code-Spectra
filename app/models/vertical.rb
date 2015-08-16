# == Schema Information
#
# Table name: verticals
#
#  id         :integer          not null, primary key
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  name       :string(255)
#  is_hidden  :boolean          default(FALSE)
#

class Vertical < ActiveRecord::Base

	attr_accessible :name, :account_id, :account_template_id, :description, :icon_type, :custom_icon, :custom_icon_url
	has_many :dashboards, :dependent => :destroy
	has_many :permissions, :as => :permissible, :dependent => :destroy
	belongs_to :account
	belongs_to :account_template

	has_attached_file :custom_icon, :styles => { :medium => "300x300>", :thumb => "100x100>" }
	validates_attachment_content_type :custom_icon, :content_type => /\Aimage\/.*\Z/

	validates_uniqueness_of :name, :scope => :account_id
	validates_presence_of   :name


	validates_presence_of   :account
	before_create :check_limit

  	def custom_icon_url	    
	    self.custom_icon.url(:thumb) if self.custom_icon
  	end

	def dashboards
		current_user = User.current_user
		is_admin_for_vertical=current_user.permissions.find_all_by_permissible_type_and_permissible_id("Vertical",self.id)
		if current_user.is_admin || is_admin_for_vertical.length>0
			@dashboards = Dashboard.where('vertical_id=?',self.id)
		else
			permissible_dashboards=current_user.permissions.find_all_by_permissible_type("Dashboard").map(&:permissible_id)
			current_vertical_dashboard_ids=Dashboard.where('vertical_id=?',self.id).map(&:id) 
			permissible_dashboard_ids= permissible_dashboards &  current_vertical_dashboard_ids
			@dashboards = Dashboard.find_all_by_id(permissible_dashboard_ids)
		end		
		return @dashboards
	end

	def check_limit
		if self.account.verticals.length && self.account.verticals_limit && self.account.verticals.length < self.account.verticals_limit
			 return true
		else
			 return false
		end 
	end
end