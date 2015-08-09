# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ :name => 'Chicago' }, { :name => 'Copenhagen' }])
#   Mayor.create(:name => 'Emanuel', :city => cities.first)

puts "CEREBRATE ACCOUNT"
account = Account.find_or_create_by_name(:name => 'Cerebrate Inc', :account_type => 'super');

puts 'DEFAULT USERS'
user = User.find_or_create_by_email :first_name => 'Admin', :last_name => 'Admin_last', :email => 'admin@cibi.com', :password => 'adminPass#1', :password_confirmation => 'adminPass#1', :is_admin => true, :account => account
puts 'user: ' << user.email

user = User.find_or_create_by_email :first_name => 'Demo', :last_name => 'Demo_last', :email => 'demo@cibi.com', :password => 'demoPass#1', :password_confirmation => 'demoPass#1', :is_admin => false, :account => account
puts 'user: ' << user.email


user = User.find_or_create_by_email :first_name => 'Shon', :last_name => 'Saoji', :email => 'shon@cerebrateinc.com', :password => 'shonPass#1', :password_confirmation => 'shonPass#1', :is_admin => false, :account => account
puts 'user: ' << user.email

user = User.find_or_create_by_email :first_name => 'Tanmay', :last_name => 'Golhar', :email => 'tanmay@cerebrateinc.com', :password => 'tanmayPass#1', :password_confirmation => 'tanmayPass#1', :is_admin => false, :account => account
puts 'user: ' << user.email

user = User.find_or_create_by_email :first_name => 'Eashwar', :last_name => 'Iyer', :email => 'eashwar@cerebrateinc.com', :password => 'eashwarPass#1', :password_confirmation => 'eashwarPass#1', :is_admin => false, :account => account
puts 'user: ' << user.email

user = User.find_or_create_by_email :first_name => 'Aziz', :last_name => 'Jiwani', :email => 'aziz@cerebrateinc.com', :password => 'azizPass#1', :password_confirmation => 'azizPass#1', :is_admin => false, :account => account
puts 'user: ' << user.email

user = User.find_or_create_by_email :first_name => 'Shyam', :last_name => 'Munshi', :email => 'shyam@cerebrateinc.com', :password => 'shyamPass#1', :password_confirmation => 'shyamPass#1', :is_admin => false, :account => account
puts 'user: ' << user.email

user = User.find_or_create_by_email :first_name => 'Kapil', :last_name => 'Umalkar', :email => 'kapil@cerebrateinc.com', :password => 'kapilPass#1', :password_confirmation => 'kapilPass#1', :is_admin => false, :account => account
puts 'user: ' << user.email