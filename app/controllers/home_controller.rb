require 'csv'
class HomeController < ApplicationController
  respond_to :json

  def index        
  end

  def data
    filename = "#{::Rails.root}/public/data/world-110m2.json"
    contents = File.read(filename)

    render :text => contents
  end

  def login
  end

end
