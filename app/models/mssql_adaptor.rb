class MssqlAdaptor

	def self.get_adapter(connect)
	    begin
	      	db = TinyTds::Client.new(
					:host => connect["host"],
					:username => connect["username"],
					:password => connect["password"],
					:port => connect["port"].to_i,
					:dataserver => connect["dataserver"],
					:database => connect["database"], 
					:timeout => connect["read_timeout"],
					:login_timeout => 4
				)
			return db
	    rescue Exception => e
	      return nil
	    end
	end

  	def execute(connect, query, isPreviewQuery)
	    conn = MssqlAdaptor::get_adapter(connect)
	    results = []
	    if(conn)
	    	if(isPreviewQuery)
                query="SELECT TOP 15 * FROM (#{query}) AS DAT"
            end
	      	res = conn.execute(query)
			res.each do |rowset|
				results << rowset
			end
	    else
	      	raise "Connection not established" 
	    end
	    results
  	end

  	def add_bookmark_condition(bookmark_parameters, query)
        value=bookmark_parameters["bookmark_value"]
        bookmark_key=bookmark_parameters["bookmark_key"]
        bookmark_comparison_operator=bookmark_parameters["bookmark_comparison_operator"]
        
        bookmark_key_field="[#{bookmark_key}]"          
        
        query=query.gsub("$$CIBI_BOOKMARK_CONDITION", " #{bookmark_key_field} #{bookmark_comparison_operator} '#{value}'")
        return query
    end

end