namespace :admin do
	desc "Rake task to generate starter configs"
	task :create_user => :environment do
		puts 'Creating new account!'
		a = Account.new
		a.name = 'Adhishwar India'
		a.account_type = ''
		a.admin_users_limit = nil
		a.manager_users_limit = nil
		a.basic_users_limit = nil
		a.data_sources_limit = nil
		a.verticals_limit = nil
		a.time_limit = 1.months.from_now.utc
		account_saved = a.save

		if account_saved
			puts 'Creating new user!'
			u = User.new
			u.first_name = 'Admin'
			u.last_name = ''
			u.email = 'admin@adhishwarindia.com'
			u.password = 'adminPass#1'
			u.password_confirmation = 'adminPass#1'
			u.is_admin = true
			u.account = a
			u.save
		end
	end
end
