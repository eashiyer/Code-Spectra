require 'spec_helper'

describe AuthServer do
	
	before(:each) do
		@attr = {
			:id => 3, 
			:auth_server_url => "http://localhost:3001",
			:client_name => "fungroo",
			:account => FactoryGirl.create(:account)
		}
	end
	it { should belong_to :account}
  	it { should validate_uniqueness_of(:client_id) }
  	it { should validate_presence_of :account}

	describe "#generate_client_id" do
		it "should generate a client_id for AuthServer" do
			expected_val = "573b7d6880e31124fe249783708b659d"
			authServer = FactoryGirl.create(:auth_server, @attr)
			expect(authServer.generate_client_id).to eq(expected_val)
			authServer.save!
		end
	end

	describe ".get_auth_server" do
		it "should get auth_server using client_id" do
			authServer = FactoryGirl.create(:auth_server,@attr)
			AuthServer.stub(:new).and_return(authServer)
			client_id = '573b7d6880e31124fe249783708b659d';
			expect(AuthServer.get_auth_server(client_id)).to be_true
		end
	end
end