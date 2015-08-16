class MysqlAdapter
	def self.check_connection(host, dbname, user, pass, port, socket)
		con = Mysql.new host, user, pass, dbname, port, socket
		puts con.get_server_info
	end

	def get_tables(host, user, pass, dbname)
		tables=[]
		conn=Mysql2::Client.new(
				:host => host,
				:username => user,
				:password => pass
			)
		results=conn.query("Select * from INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='#{dbname}';")
		results.each do |res|
			tables << res["TABLE_NAME"]
		end
		tables
	end

	def get_fields(host, user, pass, dbname, table_name)
		fields=[]
		conn=Mysql2::Client.new(:host => host, :username => user, :password => pass)
		results=conn.query("Select * from INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='#{dbname}' AND TABLE_NAME='#{table_name}';")
		results.each do |res|
			fields << {
				"fieldName" => res["COLUMN_NAME"],
				"fieldType" => res["COLUMN_TYPE"]
			}
		end
		fields
	end

	


end