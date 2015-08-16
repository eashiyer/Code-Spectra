require 'oci8'
class OracleAdaptor

    def self.get_adapter(connect)
        begin
            dbname = "//#{connect["host"]}:#{connect["port"].to_i}/#{connect["service_name"]}" #service name needs to be appended
            db = OCI8.new(connect["username"], connect["password"], dbname)
            return db
        rescue Exception => e
            return nil
        end
    end

    def execute(connect, query, isPreviewQuery)
        conn = OracleAdaptor.get_adapter(connect)
        results = []
        if(conn)
            if(isPreviewQuery)
                query="SELECT * FROM (#{query}) WHERE ROWNUM <=15"
            end
            debugger
            res = conn.exec(query)
            while row = res.fetch_hash
                results << row
            end
        else
            raise "Connection not established" 
        end
        results
    end

    def add_bookmark_condition(bookmark_parameters, query)
        value=bookmark_parameters["bookmark_value"]
        if value == nil
            value = 0
        end
        bookmark_key_type=bookmark_parameters["bookmark_key_type"]
        bookmark_key=bookmark_parameters["bookmark_key"]
        bookmark_comparison_operator=bookmark_parameters["bookmark_comparison_operator"]
        
        if bookmark_key_type == "datetime"
            bookmark_key_field = "TO_CHAR(`#{bookmark_key}`,'YYYY-MM-DD HH24:MI:SS')"
        elsif bookmark_key_type == "date"
            bookmark_key_field = "TO_CHAR(`#{bookmark_key}`,'YYYY-MM-DD')"
        elsif bookmark_key_type == "time"
            bookmark_key_field = "TO_CHAR(`#{bookmark_key}`,'HH24:MI:SS')"
        else
            bookmark_key_field="`#{bookmark_key}`"
        end

        query=query.gsub("$$CIBI_BOOKMARK_CONDITION", " #{bookmark_key_field} #{bookmark_comparison_operator} '#{value}'")
        return query
    end

end