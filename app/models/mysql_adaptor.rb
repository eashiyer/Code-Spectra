class MysqlAdaptor


    def self.get_adapter(connect)
        begin
            db = Mysql2::Client.new(
                    :host => connect["host"],
                    :username => connect["username"],
                    :password => connect["password"],
                    :port => connect["port"].to_i,
                    :database => connect["database"],
                    :socket => connect["socket"],
                    :read_timeout => connect["read_timeout"],
                    :connect_timeout => 4,
            )
            return db
        rescue Exception => e
            return nil
        end
    end

    def execute(connect, query, isPreviewQuery)
        conn = MysqlAdaptor.get_adapter(connect)
        results = []
        if(conn)
            if(isPreviewQuery)
                query="SELECT * FROM (#{query}) AS DAT LIMIT 15"
            end
            conn.query(query).each do |row|
                results << row
            end
        else
            raise "Connection not established" 
        end
        results
    end

    def add_bookmark_condition(bookmark_parameters, query)
        value=bookmark_parameters["bookmark_value"]
        bookmark_key_type=bookmark_parameters["bookmark_key_type"]
        bookmark_key=bookmark_parameters["bookmark_key"]
        bookmark_comparison_operator=bookmark_parameters["bookmark_comparison_operator"]
        
        if bookmark_key_type == "datetime"
            bookmark_key_field = "date_format(`#{bookmark_key}`,'%Y-%m-%d %H:%i:%s')"
        elsif bookmark_key_type == "date"
            bookmark_key_field = "date_format(`#{bookmark_key}`,'%Y-%m-%d')"
        elsif bookmark_key_type == "time"
            bookmark_key_field = "date_format(`#{bookmark_key}`,'%H:%i:%s')"
        else
            bookmark_key_field="`#{bookmark_key}`"
        end          
        
        query=query.gsub("$$CIBI_BOOKMARK_CONDITION", " #{bookmark_key_field} #{bookmark_comparison_operator} '#{value}'")
        return query
    end

end