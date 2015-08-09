require 'spec_helper'

describe MssqlAdaptor do
	before do
		@connect={}
		@connect['host'] = "54.191.205.217"
		@connect['username'] = "root"
		@connect['password'] = "root$2014"
		@connect['port'] = "1433"
		@connect['database'] = "test2"
		@connect['read_timeout'] = 16
		@query = "select * from dbo.employee"
	end

	describe ".get_adapter" do		
		it "should return TinyTds client instance" do
			expect(MssqlAdaptor.get_adapter(@connect)).not_to eql(nil)
		end

		it "should return nil if exception is raised" do
			@connect['password']="root2014"
			expect(MssqlAdaptor.get_adapter(@connect)).to eql(nil)
		end
	end

	describe "#execute" do
	  	it "should return query results if connection establishes" do
	  		mssql_adaptor=MssqlAdaptor.new  		
	  		expect(mssql_adaptor.execute(@connect, @query, false)).not_to eql(nil)
	  		expect(mssql_adaptor.execute(@connect, @query, true)).not_to eql(nil)
		end		

	  	it "should raise error if connection is not established" do
	  		mssql_adaptor=MssqlAdaptor.new
	  		@connect['password']="root2014"
	  		expect { mssql_adaptor.execute(@connect, @query, false) }.to raise_error
		end
	end

	describe "#add_bookmark_condition" do
		before do
			@bookmark_parameters={}
			@bookmark_parameters["bookmark_key"]="id"
			@bookmark_parameters["bookmark_comparison_operator"]=">"
			@bookmark_parameters["bookmark_value"]="2"
		end

	  	it "should return query with bookmark condition added" do
	  		mssql_adaptor=MssqlAdaptor.new
	  		query="select * from dbo.employee where $$CIBI_BOOKMARK_CONDITION"
	  		expect(mssql_adaptor.add_bookmark_condition(@bookmark_parameters, query)).to eql("select * from dbo.employee where  [id] > '2'")
		end		
	end

end