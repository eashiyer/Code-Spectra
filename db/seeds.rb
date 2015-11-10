# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ :name => 'Chicago' }, { :name => 'Copenhagen' }])
#   Mayor.create(:name => 'Emanuel', :city => cities.first)

puts "Spectra Account"
# account = Account.find_or_create_by_name(:name => 'Cerebrate Inc', :account_type => 'super');
account = Account.find_by_name('Spectra Inc')
unless account.blank?
  account.name = "Spectra Inc"
  account.save
end

account = Account.find_by_name('New Cerebrate')
unless account.blank?
  account.name = "New Spectra"
  account.save
end

puts 'Default User for Spectra'
account = Account.find_by_name('Spectra Inc')

# user = User.find_or_create_by_email :first_name => 'Admin', :last_name => 'Admin_last', :email => 'admin@cibi.com', :password => 'adminPass#1', :password_confirmation => 'adminPass#1', :is_admin => true, :account => account
# puts 'user: ' << user.email


# user = User.find_or_create_by_email :first_name => 'Admin', :last_name => 'Spectra', :email => 'admin@mspectrumsolutions.com', :password => 'mailPass#1', :password_confirmation => 'mailPass#1', :is_admin => true, :account => account
# puts 'user: ' << user.email

# user = User.find_or_create_by_email :first_name => 'Phuong', :last_name => 'Huynh', :email => 'phuonghqh@gmail.com', :password => 'waiting2212', :password_confirmation => 'waiting2212', :is_admin => false, :account => account
# puts 'user: ' << user.email


# user = User.find_or_create_by_email :first_name => 'Shon', :last_name => 'Saoji', :email => 'shon@cerebrateinc.com', :password => 'shonPass#1', :password_confirmation => 'shonPass#1', :is_admin => false, :account => account
# puts 'user: ' << user.email
#
# user = User.find_or_create_by_email :first_name => 'Tanmay', :last_name => 'Golhar', :email => 'tanmay@cerebrateinc.com', :password => 'tanmayPass#1', :password_confirmation => 'tanmayPass#1', :is_admin => false, :account => account
# puts 'user: ' << user.email
#
# user = User.find_or_create_by_email :first_name => 'Eashwar', :last_name => 'Iyer', :email => 'eashwar@cerebrateinc.com', :password => 'eashwarPass#1', :password_confirmation => 'eashwarPass#1', :is_admin => false, :account => account
# puts 'user: ' << user.email
#
# user = User.find_or_create_by_email :first_name => 'Aziz', :last_name => 'Jiwani', :email => 'aziz@cerebrateinc.com', :password => 'azizPass#1', :password_confirmation => 'azizPass#1', :is_admin => false, :account => account
# puts 'user: ' << user.email
#
# user = User.find_or_create_by_email :first_name => 'Shyam', :last_name => 'Munshi', :email => 'shyam@cerebrateinc.com', :password => 'shyamPass#1', :password_confirmation => 'shyamPass#1', :is_admin => false, :account => account
# puts 'user: ' << user.email
#
# user = User.find_or_create_by_email :first_name => 'Kapil', :last_name => 'Umalkar', :email => 'kapil@cerebrateinc.com', :password => 'kapilPass#1', :password_confirmation => 'kapilPass#1', :is_admin => false, :account => account
# puts 'user: ' << user.email
#

# user = User.find_by_email('management@cerebrateinc.com')
# user.destroy unless user.blank?

# user = User.find_by_email('admin@cibi.com')
# user.destroy unless user.blank?

# user = User.find_by_email('phuonghqh@gmail.com')
# user.destroy unless user.blank?
