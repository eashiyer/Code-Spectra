class Permission < ActiveRecord::Base
  attr_accessible :user_id, :permissible_id, :permissible_type, :role

  belongs_to :permissible, :polymorphic => true
  belongs_to :user

  ROLES = %w[basic manager admin]

  def can_perform?(action)
  	role = self.role
  	case role
  	when "admin"
  		return true
  	when "manager"
  		return action != "destroy"
  	else
  		return action == "show" || action == "index"	
  	end
  end

  def self.role_can_perform?(role, action)
    case role
    when "admin"
      return true
    when "manager"
      return action != "destroy"
    else
      return action == "show" || action == "index"  
    end
  end

  def self.get_permissibles_hierarchy(permissible_type = nil)
    case permissible_type
    when "Vertical"
      return []
    when "Dashboard"
      return ["Vertical"]
    else
      return ["Vertical", "Dashboard"]
    end
  end

  # Returns the precedence of role1 over role2
  # => Privileges of Role1 override that of Role2
  def self.preceding_role(role1, role2)
    self::ROLES.index(role1) > self::ROLES.index(role2) ? role1 : role2
  end
end
