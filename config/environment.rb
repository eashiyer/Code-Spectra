# Load the rails application
require File.expand_path('../application', __FILE__)
require 'csv'

Encoding.default_external = Encoding::UTF_8
Encoding.default_internal = Encoding::UTF_8

# Initialize the rails application
Cibi::Application.initialize!


if defined?(ActiveRecord)
  ActiveRecord::Base.include_root_in_json = false
end