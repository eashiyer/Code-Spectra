require 'spec_helper'

describe DataConnection do
	it { should belong_to(:account) }
 	it { should have_many(:query_data_sources) }

 	it { should validate_presence_of(:account) }

 	describe "#connection_status" do
		before(:each) do   
			@account =  FactoryGirl.create(:account)
		    @data_connection = FactoryGirl.create(:data_connection, :account => @account)
		end	

	  	it "should return connection status" do
	  		Mysql2::Client.stub(:new).and_return(true)
	  		data_connection = FactoryGirl.create(:data_connection, :account => @account, :connection_type => 'mysql')
	  		expect(data_connection.connection_status).to eql(true)
		end

	  	it "should return connection status false if no connection" do
	  		Mysql2::Client.stub(:new).and_return(nil)
	  		data_connection = FactoryGirl.create(:data_connection, :account => @account, :connection_type => 'mysql')
	  		expect(@data_connection.connection_status).to eql(false)
		end
	end

	describe "#check_connection" do
		before(:each) do   
			@account =  FactoryGirl.create(:account)
		    @data_connection = FactoryGirl.create(:data_connection, :account => @account)
		end

	  	it "should return true if connection is established" do
	  		Mysql2::Client.stub(:new).and_return(true)
	  		data_connection = FactoryGirl.create(:data_connection, :account => @account, :connection_type => 'mysql')
	  		expect(data_connection.check_connection).to eql(true)
		end		

	  	it "should return false if exception is caught" do
	  		data_connection = FactoryGirl.create(:data_connection, :account => @account, :connection_type => 'mysql')
	  		data_connection.stub(:get_adapter).and_raise(Exception)
	  		expect(data_connection.check_connection).to eql(false)
		end			
	end

	describe "#get_adapter" do
		before(:each) do   
			@account =  FactoryGirl.create(:account)
		    @data_connection = FactoryGirl.create(:data_connection, :account => @account)
		end

	  	it "should return nil if connection type is not mysql" do
	  		data_connection = FactoryGirl.create(:data_connection, :account => @account, :connection_type => 'pg')
	  		expect(data_connection.get_adapter).to eql(nil)
		end		

	  	it "should return nil if exception is caught" do
	  		Mysql2::Client.stub(:new).and_raise(Exception)
	  		data_connection = FactoryGirl.create(:data_connection, :account => @account, :connection_type => 'mysql')
	  		expect(data_connection.get_adapter).to eql(nil)
		end

	  	it "should return a db object if connection established " do
	  		Mysql2::Client.stub(:new).and_return(true)
	  		data_connection = FactoryGirl.create(:data_connection, :account => @account, :connection_type => 'mysql')
	  		expect(data_connection.get_adapter).to eql(true)
		end							
	end	

	describe "#execute" do
		before(:each) do   
			@account =  FactoryGirl.create(:account)
		    @data_connection = FactoryGirl.create(:data_connection, :account => @account)
		end

	  	it "should return query result if get adapter returns true" do
	  		query = "select * from users;"
	  		data_connection = FactoryGirl.create(:data_connection, :account => @account, :connection_type => 'pg')
	  		data_connection.stub(:get_adapter).and_return(true)
	  		data_connection.stub_chain(:get_adapter,:query).and_return(['test', 'test2'])
	  		expect(data_connection.execute(query)).to eql(["test", "test2"])
		end		

	  	it "should raise error if adapter returns nil" do
	  		query = "select * from users;"
	  		data_connection = FactoryGirl.create(:data_connection, :account => @account, :connection_type => 'mysql')
	  		data_connection.stub(:get_adapter).and_return(nil)	  		
	  		expect { data_connection.execute(query) }.to raise_error
		end					
	end	


end
