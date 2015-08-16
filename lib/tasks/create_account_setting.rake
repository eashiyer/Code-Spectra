namespace :account do
	desc "Rake task to generate starter configs for Account"
	task :create_settings => :environment do
		accounts = Account.all
		i=0
		ActiveRecord::Base.transaction do
			accounts.each do |account|
				unless account.account_setting
					AccountSetting.create(:account_id => account.id, :timezone => 'UTC', :currency => 'USD')
					i = i+1
				end
			end
			puts "Accounts updated:#{i}"
		end
	end
end