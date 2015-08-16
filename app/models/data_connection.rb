# == Schema Information
#
# Table name: data_connections
#
#  id              :integer          not null, primary key
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  display_name    :string(255)
#  host            :string(255)      not null
#  dbname          :string(255)
#  username        :string(255)
#  password        :string(255)
#  port            :string(255)
#  socket          :string(255)
#  use_ssl         :boolean
#  query_duration  :integer
#  connection_type :string(255)
#
class DataConnection < ActiveRecord::Base
	attr_accessible :display_name, :host, :dbname, 
					:username, :password, :port, 
					:socket, :use_ssl, :query_duration, 
					:connection_type, :account_id, :service_name, :data_server_name

	belongs_to :account
	has_many :query_data_sources
	# after_find :connection_status
	
	
	validates_presence_of :account

	def connection_status
		@connection_status || self.check_connection
	end

	def check_connection
		begin 
			case self.connection_type
			when 'mysql'				
				db = MysqlAdaptor.get_adapter(self.get_connection_json)
			when 'mssql'
				db = MssqlAdaptor.get_adapter(self.get_connection_json)
			when 'oracle'
				db = OracleAdaptor.get_adapter(self.get_connection_json)
			end			
			return !db.nil?
		rescue Exception => e
			return false;
		end
	end

	def execute(query, isPreviewQuery=false, bookmarkParameters=nil)
		connect=self.get_connection_json
		begin
			case self.connection_type
			when 'mysql'
				conn=MysqlAdaptor.new
			when 'mssql'
				conn=MssqlAdaptor.new
			when 'oracle'
				conn=OracleAdaptor.new
			end
			if bookmarkParameters
				query=conn.add_bookmark_condition(bookmarkParameters, query)
			end
			results=conn.execute(connect, query, isPreviewQuery)
		rescue Exception => e	
			raise e
		end
		results
	end

	def get_connection_json
		connect={}
		connect['host'] = self.host
		connect['username'] = self.username
		connect['password'] = self.password
		connect['port'] = self.port.to_i
		connect['database'] = self.dbname
		connect['socket'] = self.socket
		connect['read_timeout'] = (self.query_duration)? (self.query_duration/1000) : 16
		connect['service_name'] = self.service_name
		connect['dataserver'] = self.data_server_name
		return connect
	end

end
