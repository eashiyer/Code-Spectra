require 'spec_helper'

describe MysqlAdaptor do
	before do
		@connect={}
		@connect['host'] = "127.0.0.1"
		@connect['username'] = "root"
		@connect['password'] = "sk4scrappers"
		@connect['port'] = "3306"
		@connect['database'] = "cibi_test"
		@connect['read_timeout'] = 16
		@query = "select * from users"
	end

	describe ".get_adapter" do		
		it "should return Mysql client instance" do
			expect(MysqlAdaptor.get_adapter(@connect)).not_to eql(nil)
		end

		it "should return nil if exception is raised" do
			@connect['password']="sk4scraps"
			expect(MysqlAdaptor.get_adapter(@connect)).to eql(nil)
		end
	end

	describe "#execute" do
	  	it "should return query results if connection establishes" do
	  		mysql_adaptor=MysqlAdaptor.new  		
	  		expect(mysql_adaptor.execute(@connect, @query, false)).not_to eql(nil)
	  		expect(mysql_adaptor.execute(@connect, @query, true)).not_to eql(nil)
		end		

	  	it "should raise error if connection is not established" do
	  		mysql_adaptor=MysqlAdaptor.new
	  		@connect['password']="sk4scraps"
	  		expect { mysql_adaptor.execute(@connect, @query, false) }.to raise_error
		end
	end

	describe "#add_bookmark_condition" do
		before do
			@bookmark_parameters={}
			@bookmark_parameters["bookmark_key"]="created_at"			
			@bookmark_parameters["bookmark_comparison_operator"]=">"
		end

	  	it "should return query with bookmark condition added for key type 'datetime'" do
	  		mysql_adaptor=MysqlAdaptor.new
	  		@bookmark_parameters["bookmark_key_type"]="datetime"
	  		@bookmark_parameters["bookmark_value"]="2014-08-13 08:01:36"
	  		
	  		query="select * from users where $$CIBI_BOOKMARK_CONDITION"
	  		expect(mysql_adaptor.add_bookmark_condition(@bookmark_parameters, query)).to eql("select * from users where  date_format(`created_at`,'%Y-%m-%d %H:%i:%s') > '2014-08-13 08:01:36'")
		end	

		it "should return query with bookmark condition added for key type 'date'" do
	  		mysql_adaptor=MysqlAdaptor.new
	  		@bookmark_parameters["bookmark_key_type"]="date"
	  		@bookmark_parameters["bookmark_value"]="2014-08-13"
	  		
	  		query="select * from users where $$CIBI_BOOKMARK_CONDITION"
	  		expect(mysql_adaptor.add_bookmark_condition(@bookmark_parameters, query)).to eql("select * from users where  date_format(`created_at`,'%Y-%m-%d') > '2014-08-13'")
		end	

		it "should return query with bookmark condition added for key type 'time'" do
	  		mysql_adaptor=MysqlAdaptor.new
	  		@bookmark_parameters["bookmark_key_type"]="time"
	  		@bookmark_parameters["bookmark_value"]="08:01:36"
	  		
	  		query="select * from users where $$CIBI_BOOKMARK_CONDITION"
	  		expect(mysql_adaptor.add_bookmark_condition(@bookmark_parameters, query)).to eql("select * from users where  date_format(`created_at`,'%H:%i:%s') > '08:01:36'")
		end	

		it "should return query with bookmark condition added for any other key type" do
	  		mysql_adaptor=MysqlAdaptor.new
	  		@bookmark_parameters["bookmark_key_type"]="string"
	  		@bookmark_parameters["bookmark_value"]="2014-08-13 08:01:36"
	  		
	  		query="select * from users where $$CIBI_BOOKMARK_CONDITION"
	  		expect(mysql_adaptor.add_bookmark_condition(@bookmark_parameters, query)).to eql("select * from users where  `created_at` > '2014-08-13 08:01:36'")
		end		
	end

end