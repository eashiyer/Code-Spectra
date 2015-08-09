class AuthServer < ActiveRecord::Base
  require 'digest/md5'
  attr_accessible :auth_server_url, :client_id, :client_name, :account_id

  belongs_to :account
  
  validates_uniqueness_of :client_id
  validates_presence_of :account
  
  before_create :generate_client_id
  
  def self.get_auth_server(client_id)
  	auth_server = AuthServer.find_by_client_id(client_id)
  	auth_server
  end

  def generate_client_id
  		self.client_id = Digest::MD5.hexdigest("#{client_name}#{auth_server_url}")
  end	
end
