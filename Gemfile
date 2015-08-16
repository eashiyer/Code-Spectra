source 'https://rubygems.org'

gem 'rails', '3.2.13'

#gem 'flamegraph'
#gem 'rack-mini-profiler'
#gem 'thin'


gem 'sqlite3'
gem 'json'
gem 'rake', '>= 0.9.2.2'

# Gems used only for assets and not required
# in production environments by default.
gem 'sass-rails',   '~> 3.2.3'

gem 'bootstrap-sass'
gem 'jquery-rails'
gem 'jquery-plugins-rails', :git => 'https://github.com/cerebrateinc/jquery-plugins-rails.git'
gem 'slickgrid-rails', :git => 'https://github.com/cerebrateinc/slickgrid-rails.git'
gem 'd3-rails', :git => 'https://github.com/iblue/d3-rails.git'
gem 'crossfilter-rails'
gem 'ember-rails'
gem 'ember-source', '1.0.0.rc6'
gem 'ember-auth-rails'
gem 'mysql'
gem 'mysql2'
gem 'tiny_tds'
gem 'activerecord-sqlserver-adapter'
gem 'topojson-rails'
gem 'd3js-plugins-rails'
gem 'bootstrap-datetimepicker-rails'
#gem 'bootstrap-multiselect-rails'
gem 'jquery-multiselect-rails', :git => 'https://github.com/arojoal/jquery-multiselect-rails.git'
gem 'sidekiq', '2.13.0'
gem 'slim', '>= 1.1.0'
# if you require 'sinatra' you get the DSL extended to Object
gem 'sinatra', '>= 1.3.0', :require => nil
gem 'roo', :git => 'https://github.com/ketan21/roo.git'
gem 'devise', '3.0.0'
gem 'curb'
gem "mail"
gem 'redis'
gem 'rmagick', :require => false
gem 'newrelic_rpm'
gem "paperclip", "~> 4.1"
#gem 'rubyzip',  "~> 0.9.9"
gem 'rubyzip',  "~> 1.0.0"
gem 'zip-zip', '~> 0.3'

gem 'ruby-oci8', '~> 2.1.7'
gem 'activeadmin', '0.5.0'
gem 'watir-webdriver'
gem 'headless'
gem "selenium-webdriver", "~> 2.43.0"

group :assets do
  gem 'coffee-rails', '~> 3.2.1'
  # See https://github.com/sstephenson/execjs#readme for more supported runtimes
  # gem 'execjs'
  gem 'therubyracer', :platforms => :ruby
  
	gem 'jquery.fileupload-rails'
  gem 'uglifier', '>= 1.0.3'
  gem 'closure-compiler'
end

group :development, :test do
  gem "rspec-rails", "~> 2.0"
  gem "jasminerice", :git => 'https://github.com/bradphelan/jasminerice.git'
  gem 'debugger'
  gem 'factory_girl_rails'
  gem "letter_opener"
  #gem 'rails-dev-boost', :git => 'https://github.com/thedarkone/rails-dev-boost.git'
end

group :test do
  gem "shoulda-matchers"
  gem "capybara"
  gem "guard-rspec"
  gem "database_cleaner"
  gem "shoulda-callback-matchers", "~> 1.0"
  gem "vcr"
  gem "webmock"
end
gem "capistrano", '2.15.4', :group => :development

gem 'simplecov', :require => false, :group => :test

gem 'paper_trail', '~> 3.0.5'
