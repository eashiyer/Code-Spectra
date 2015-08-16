class AuditedModel < ActiveRecord::Base
	self.abstract_class = true

	has_paper_trail
	PaperTrail.config.version_limit = 3

	def get_audit_details
		last_change = self.versions.last
		if last_change
			user = User.find last_change.whodunnit.to_i
		end
		
		if user
			username = "#{user.first_name} #{user.last_name}"
		end
		
		changeset = self.versions.last.changeset
		created_at = self.versions.last.created_at

		change_string = "#{changeset.keys[0]} from #{changeset.values[0][0]} to #{changeset.values[0][1]}"
		details = "#{username} changed #{change_string} at #{created_at}"

		details 
	end
end