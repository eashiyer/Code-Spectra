require "bundler/capistrano" 
require 'sidekiq/capistrano'

set :scm, :git
set :application, "cibi"
set :repository, "git@github.com:shonsaoji/cibi.git"
set :scm_user, "shon"  # The server's user for deploys
set :scm_passphrase, "macintosh"  # The deploy user's password
set :ssh_options, { :forward_agent => true }

set :user, 'root'
set :use_sudo, false
set :branch, "feature/13/9/iss"

# set :scm, :git # You can set :scm explicitly or Capistrano will make an intelligent guess based on known version control directory names
# Or: `accurev`, `bzr`, `cvs`, `darcs`, `git`, `mercurial`, `perforce`, `subversion` or `none`

task :staging do
  server "ec2-54-214-147-245.us-west-2.compute.amazonaws.com", :app, :web, :db, :primary => true
end

task :demo do
  server "ec2-54-214-177-9.us-west-2.compute.amazonaws.com", :app, :web, :db, :primary => true
end

task :nmu do
  server "14.139.120.180", :app, :web, :db, :primary => true
  set :branch, "feature/13/9/iss"
end

task :s1 do
  server "198.251.79.225", :app, :web, :db, :primary => true
  set :branch, "feature/13/9/iss"
end

task :s2 do
  server "ec2-54-212-144-49.us-west-2.compute.amazonaws.com", :app, :web, :db, :primary => true
  set :branch, "feature/13/9/iss"
end

task :stage do
  server "63.142.242.221", :app, :web, :db, :primary => true
  set :branch, "feature/15/05/20/globalFilterFixes"
end

task :vms do
  server "182.74.187.37", :app, :web, :db, :primary => true
  set :branch, "feature/13/9/iss"
end

task :ankur do
  server "117.247.82.163", :app, :web, :db, :primary => true
  set :branch, "feature/13/9/iss"
end

# if env == "demo"
#   
# else
#   server "staging", :app, :web, :db, :primary => true
# end

# role :web, "your web-server here"                          # Your HTTP server, Apache/etc
# role :app, "your app-server here"                          # This may be the same as your `Web` server
# role :db,  "your primary db-server here", :primary => true # This is where Rails migrations will run
# role :db,  "your slave db-server here"

# if you want to clean up old releases on each deploy uncomment this:
# after "deploy:restart", "deploy:cleanup"

# if you're still using the script/reaper helper you will need
# these http://github.com/rails/irs_process_scripts

# If you are using Passenger mod_rails uncomment this:
namespace :deploy do

  task :start do 
    echo "#{env}"
  end
  task :stop do ; end

  desc "reload the database with seed data"
  task :seed do
    run "cd #{current_path}; bundle exec rake db:seed RAILS_ENV=#{rails_env}"
  end  

  task :restart, :roles => :app, :except => { :no_release => true } do
    run "#{try_sudo} touch #{File.join(current_path,'tmp','restart.txt')}"
  end

  task :change_ownership do
  	run "chown -R apache.apache /u/apps/*"
    run "/sbin/service httpd restart"
  end
end


after 'deploy:update_code', 'deploy:migrate'
after 'deploy:update_code', 'deploy:change_ownership'
# after 'deploy:change_ownership', 'deploy:seed'
set :keep_releases, 5
after "deploy:restart", "deploy:cleanup" 



