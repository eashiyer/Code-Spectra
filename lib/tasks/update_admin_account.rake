namespace :admin do
	desc "Rake task to generate starter configs"
	task :update_account => :environment do
		u = User.find_by_email "admin@cibi.com"
		u.confirmed_at = Time.now
		u.save
		if u
			a = u.account
			a.admin_users_limit = 999
			a.basic_users_limit = 999
			a.data_sources_limit = 9999
			a.verticals_limit = 9999
			a.time_limit = 10.years.from_now.utc
			a.save
		end
	end
end
