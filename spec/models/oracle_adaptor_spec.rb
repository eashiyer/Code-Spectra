require 'spec_helper'

describe OracleAdaptor do
	before do
		@connect={}
		@connect['host'] = "cerebrateinc4-Lenovo-G580"
		@connect['username'] = "SYSTEM"
		@connect['password'] = "oraclePass12"
		@connect['port'] = "1521"
		@connect['service_name'] = "XE"
		@query = "select * from DIPTI.employee"
	end

	describe ".get_adapter" do		
		it "should return Oracle client instance" do
			expect(OracleAdaptor.get_adapter(@connect)).not_to eql(nil)
		end

		it "should return nil if exception is raised" do
			@connect['password']="sk4scraps"
			expect(OracleAdaptor.get_adapter(@connect)).to eql(nil)
		end
	end

	describe "#execute" do
	  	it "should return query results if connection establishes" do
	  		oracle_adaptor=OracleAdaptor.new  		
	  		expect(oracle_adaptor.execute(@connect, @query, false)).not_to eql(nil)
	  		expect(oracle_adaptor.execute(@connect, @query, true)).not_to eql(nil)
		end		

	  	it "should raise error if connection is not established" do
	  		oracle_adaptor=OracleAdaptor.new
	  		@connect['password']="sk4scraps"
	  		expect { oracle_adaptor.execute(@connect, @query, false) }.to raise_error
		end
	end

	describe "#add_bookmark_condition" do
		before do
			@bookmark_parameters={}
			@bookmark_parameters["bookmark_key"]="EMP_JOINING_DATE"			
			@bookmark_parameters["bookmark_comparison_operator"]=">"
		end

	  	it "should return query with bookmark condition added for key type 'datetime'" do
	  		oracle_adaptor=OracleAdaptor.new
	  		@bookmark_parameters["bookmark_key_type"]="datetime"
	  		@bookmark_parameters["bookmark_value"]="2014-08-22 08:01:36"
	  		
	  		query="select * from employee where $$CIBI_BOOKMARK_CONDITION"
	  		expect(oracle_adaptor.add_bookmark_condition(@bookmark_parameters, query)).to eql("select * from employee where  TO_CHAR(`EMP_JOINING_DATE`,'YYYY-MM-DD HH24:MI:SS') > '2014-08-22 08:01:36'")
		end	

		it "should return query with bookmark condition added for key type 'date'" do
	  		oracle_adaptor=OracleAdaptor.new
	  		@bookmark_parameters["bookmark_key_type"]="date"
	  		@bookmark_parameters["bookmark_value"]="2014-08-22"
	  		
	  		query="select * from employee where $$CIBI_BOOKMARK_CONDITION"
	  		expect(oracle_adaptor.add_bookmark_condition(@bookmark_parameters, query)).to eql("select * from employee where  TO_CHAR(`EMP_JOINING_DATE`,'YYYY-MM-DD') > '2014-08-22'")
		end	

		it "should return query with bookmark condition added for key type 'time'" do
	  		oracle_adaptor=OracleAdaptor.new
	  		@bookmark_parameters["bookmark_key_type"]="time"
	  		@bookmark_parameters["bookmark_value"]="08:01:36"
	  		
	  		query="select * from employee where $$CIBI_BOOKMARK_CONDITION"
	  		expect(oracle_adaptor.add_bookmark_condition(@bookmark_parameters, query)).to eql("select * from employee where  TO_CHAR(`EMP_JOINING_DATE`,'HH24:MI:SS') > '08:01:36'")
		end	

		it "should return query with bookmark condition added for any other key type" do
	  		oracle_adaptor=OracleAdaptor.new
	  		@bookmark_parameters["bookmark_key_type"]="string"
	  		@bookmark_parameters["bookmark_value"]="2014-08-22 08:01:36"
	  		
	  		query="select * from employee where $$CIBI_BOOKMARK_CONDITION"
	  		expect(oracle_adaptor.add_bookmark_condition(@bookmark_parameters, query)).to eql("select * from employee where  `EMP_JOINING_DATE` > '2014-08-22 08:01:36'")
		end		
	end

end