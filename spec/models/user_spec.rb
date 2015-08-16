require 'spec_helper'

describe User do

  before(:each) do
    @attr = {
      :email => "user@example.com",
      :password => "changeme",
      :password_confirmation => "changeme",
      :account => FactoryGirl.create(:account)
    }
  end
  
  it { should validate_presence_of :email }
  it { should validate_presence_of :account }
  it { should have_many :permissions }
  it { should belong_to :account }
  it { should have_many(:charts_users)}
  it { should have_one(:user_color_preference)}  

  it "should create a new instance given a valid attribute" do
    @user = FactoryGirl.create(:user, @attr)
    @user.should_not be_nil
  end

  it "should require an email address" do
    no_email_user = FactoryGirl.build(:user, @attr.merge(:email => ""))
    no_email_user.should_not be_valid
  end

  it "should accept valid email addresses" do
    addresses = %w[user@foo.com THE_USER@foo.bar.org first.last@foo.jp]
    addresses.each do |address|
      valid_email_user = FactoryGirl.build(:user, @attr.merge(:email => address, :account => FactoryGirl.create(:account)))
      valid_email_user.should be_valid
    end
  end

  it "should reject invalid email addresses" do
    addresses = %w[user@foo,com user_at_foo.org example.user@foo.]
    addresses.each do |address|
      invalid_email_user = FactoryGirl.build(:user, @attr.merge(:email => address))
      invalid_email_user.should_not be_valid
    end
  end

  it "should reject duplicate email addresses" do
    @user = FactoryGirl.create(:user, @attr)
    user_with_duplicate_email = FactoryGirl.build(:user, @attr)
    user_with_duplicate_email.should_not be_valid
  end

  it "should reject email addresses identical up to case" do
    upcased_email = @attr[:email].upcase
    @user = FactoryGirl.create(:user, @attr.merge(:email => upcased_email))
    user_with_duplicate_email = FactoryGirl.build(:user, @attr)
    user_with_duplicate_email.should_not be_valid
  end

  describe "passwords" do

    before(:each) do
      @user = FactoryGirl.build(:user, @attr)
    end

    it "should have a password attribute" do
      @user.should respond_to(:password)
    end

    it "should have a password confirmation attribute" do
      @user.should respond_to(:password_confirmation)
    end
  end

  describe "password validations" do

    it "should require a password" do
      FactoryGirl.build(:user, @attr.merge(:password => "", :password_confirmation => "")).
        should_not be_valid
    end

    it "should require a matching password confirmation" do
      FactoryGirl.build(:user, @attr.merge(:password_confirmation => "invalid")).
        should_not be_valid
    end

    it "should reject short passwords" do
      short = "a" * 5
      hash = @attr.merge(:password => short, :password_confirmation => short)
      FactoryGirl.build(:user, hash).should_not be_valid
    end

  end

  describe "password encryption" do

    before(:each) do
      @user = FactoryGirl.create(:user, @attr)
    end

    it "should have an encrypted password attribute" do
      @user.should respond_to(:encrypted_password)
    end

    it "should set the encrypted password attribute" do
      @user.encrypted_password.should_not be_blank
    end
  end

  describe "#has_authorization? account level admin" do
    before(:each) do
      @account = FactoryGirl.create(:account)
      @user = FactoryGirl.create(:user, {:is_admin => true, :account => @account})
      @vertical = FactoryGirl.create(:vertical, :account => @account)
      @vertical1 = FactoryGirl.create(:vertical, :account => FactoryGirl.create(:account))
    end

    it " should be able to access verticals of his account " do
      expect(@user.has_authorization?("Vertical", @vertical.id, "show")).to eq(true)
    end

    it " should not be able to access verticals of his account " do
      expect(@user.has_authorization?("Vertical", @vertical1.id, "show")).to eq(false)
    end

  end

  describe "#has_authorization? with admin user for vertical" do
    before(:each) do
      @account = FactoryGirl.create(:account)
      @user = FactoryGirl.create(:user, @attr.merge({:account => @account}))
      User.stub(:current_user).and_return(@user) 
      @vertical = FactoryGirl.create(:vertical, :account => @account)
      @vertical2 = FactoryGirl.create(:vertical, :account => @account)

      @dashboard = FactoryGirl.create(:dashboard, :vertical => @vertical)
      @dashboard2 = FactoryGirl.create(:dashboard, :vertical => @vertical2)

      @permission = FactoryGirl.create(:permission, :permissible => @vertical, :user => @user, :role => 'admin')
    end
    it "should return true for a dashboard when user is admin for the dashboard's vertical" do
      expect(@user.has_authorization?("Dashboard", @dashboard.id, "destroy")).to be(true)
    end

    it "should return false for a dashboard when user is not admin for respective vertical" do
      expect(@user.has_authorization?("Dashboard", @dashboard2.id, "destroy")).to be(false)
    end
  end

  describe "#has_authorization? with manager user for vertical" do
    before(:each) do
      @account = FactoryGirl.create(:account)
      @user = FactoryGirl.create(:user, @attr.merge({:account => @account}))
      User.stub(:current_user).and_return(@user) 

      @vertical = FactoryGirl.create(:vertical, :account => @account)
      @vertical2 = FactoryGirl.create(:vertical, :account => @account)

      @dashboard = FactoryGirl.create(:dashboard, :vertical => @vertical)
      @dashboard2 = FactoryGirl.create(:dashboard, :vertical => @vertical2)

      @permission = FactoryGirl.create(:permission, :permissible => @vertical, :user => @user, :role => 'manager')
    end
    it "should not be able to destroy the vertical" do
      expect(@user.has_authorization?("Vertical", @vertical.id, "destroy")).to be(false)
    end

    it "should be able to update the vertical" do
      expect(@user.has_authorization?("Vertical", @vertical.id, "update")).to be(true)
    end

    it "should be able to update the dashboard" do
      expect(@user.has_authorization?("Dashboard", @dashboard.id, "update")).to be(true)
    end

    it "should not be able to destroy the dashboard" do
      expect(@user.has_authorization?("Dashboard", @dashboard.id, "destroy")).to be(false)
    end

    it "should not be able to show the dashboard2" do
      expect(@user.has_authorization?("Dashboard", @dashboard2.id, "show")).to be(false)
    end

    it "should not be able to show the dashboard2" do
      expect(@user.has_authorization?("Dashboard", @dashboard.id, "show")).to be(true)
    end

  end

  describe "#has_authorization? with basic user for vertical" do
    before(:each) do
      @account = FactoryGirl.create(:account)
      @user = FactoryGirl.create(:user, @attr.merge({:account => @account}))
      User.stub(:current_user).and_return(@user) 

      @vertical = FactoryGirl.create(:vertical, :account => @account)
      
      @dashboard = FactoryGirl.create(:dashboard, :vertical => @vertical)
      
      @permission = FactoryGirl.create(:permission, :permissible => @vertical, :user => @user, :role => 'basic')
    end
    it "should not be able to destroy the vertical" do
      expect(@user.has_authorization?("Vertical", @vertical.id, "destroy")).to be(false)
    end

    it "should be able to update the vertical" do
      expect(@user.has_authorization?("Vertical", @vertical.id, "update")).to be(false)
    end

    it "should be able to update the dashboard" do
      expect(@user.has_authorization?("Dashboard", @dashboard.id, "update")).to be(false)
    end

    it "should not be able to destroy the dashboard" do
      expect(@user.has_authorization?("Dashboard", @dashboard.id, "destroy")).to be(false)
    end

    it "should not be able to show the dashboard2" do
      expect(@user.has_authorization?("Dashboard", @dashboard.id, "show")).to be(true)
    end
  end

  describe "#has_authorization? with admin user for dashboard" do
    before(:each) do
      @account = FactoryGirl.create(:account)
      @user = FactoryGirl.create(:user, @attr.merge({:account => @account}))
      @vertical = FactoryGirl.create(:vertical, :account => @account)
      
      @dashboard = FactoryGirl.create(:dashboard, :vertical => @vertical)
      
      @permission = FactoryGirl.create(:permission, :permissible => @dashboard, :user => @user, :role => 'admin')
    end
    it "should return true for a dashboard when user is admin for the dashboard" do
      expect(@user.has_authorization?("Dashboard", @dashboard.id, "destroy")).to be(true)
    end

    it "should return true for a vertical#show" do
      expect(@user.has_authorization?("Vertical", @vertical.id, "show")).to be(true)
    end

    it "should return false for a vertical#update" do
      expect(@user.has_authorization?("Vertical", @vertical.id, "update")).to be(false)
    end    
  end

  describe "#has_authorization? with manager user for dashboard" do
    before(:each) do
      @account = FactoryGirl.create(:account)
      @user = FactoryGirl.create(:user, @attr.merge({:account => @account}))
      @vertical = FactoryGirl.create(:vertical, :account => @account)
      
      @dashboard = FactoryGirl.create(:dashboard, :vertical => @vertical)
      
      @permission = FactoryGirl.create(:permission, :permissible => @dashboard, :user => @user, :role => 'manager')
    end
    it "should not be able to delete the dashboard" do
      expect(@user.has_authorization?("Dashboard", @dashboard.id, "destroy")).to be(false)
    end

    it "should be able to see the dashboard" do
      expect(@user.has_authorization?("Dashboard", @dashboard.id, "show")).to be(true)
    end

    it "should be able to update the dashboard" do
      expect(@user.has_authorization?("Dashboard", @dashboard.id, "update")).to be(true)
    end

    it "should return true for a vertical#show" do
      expect(@user.has_authorization?("Vertical", @vertical.id, "show")).to be(true)
    end

    it "should return false for a vertical#update" do
      expect(@user.has_authorization?("Vertical", @vertical.id, "update")).to be(false)
    end    

  end

  describe "#has_authorization? with basic user for dashboard" do
    before(:each) do
      @account = FactoryGirl.create(:account)
      @user = FactoryGirl.create(:user, @attr.merge({:account => @account}))
      @vertical = FactoryGirl.create(:vertical, :account => @account)
      
      @dashboard = FactoryGirl.create(:dashboard, :vertical => @vertical)
      
      @permission = FactoryGirl.create(:permission, :permissible => @dashboard, :user => @user, :role => 'basic')
    end
    it "should not be able to delete the dashboard" do
      expect(@user.has_authorization?("Dashboard", @dashboard.id, "destroy")).to be(false)
    end

    it "should be able to see the dashboard" do
      expect(@user.has_authorization?("Dashboard", @dashboard.id, "show")).to be(true)
    end

    it "should be able to update the dashboard" do
      expect(@user.has_authorization?("Dashboard", @dashboard.id, "update")).to be(false)
    end

    it "should return true for a vertical#show" do
      expect(@user.has_authorization?("Vertical", @vertical.id, "show")).to be(true)
    end

    it "should return false for a vertical#update" do
      expect(@user.has_authorization?("Vertical", @vertical.id, "update")).to be(false)
    end    

  end

  describe "#has_authorization? with basic user for chart" do
    before(:each) do
      @account = FactoryGirl.create(:account)
      @user = FactoryGirl.create(:user, @attr.merge({:account => @account}))
      @vertical = FactoryGirl.create(:vertical, :account => @account)
      
      @dashboard = FactoryGirl.create(:dashboard, :vertical => @vertical)
      
      @permission = FactoryGirl.create(:permission, :permissible => @dashboard, :user => @user, :role => 'basic')
    end
    it "should not be able to delete the dashboard" do
      expect(@user.has_authorization?("Dashboard", @dashboard.id, "destroy")).to be(false)
    end

    it "should be able to see the dashboard" do
      expect(@user.has_authorization?("Dashboard", @dashboard.id, "show")).to be(true)
    end

    it "should be able to update the dashboard" do
      expect(@user.has_authorization?("Dashboard", @dashboard.id, "update")).to be(false)
    end

    it "should return true for a vertical#show" do
      expect(@user.has_authorization?("Vertical", @vertical.id, "show")).to be(true)
    end

    it "should return false for a vertical#update" do
      expect(@user.has_authorization?("Vertical", @vertical.id, "update")).to be(false)
    end    

  end


  describe "#verticals" do
    describe "for a basic user" do
      before(:each) do
        @account = FactoryGirl.create(:account)
        @user = FactoryGirl.create(:user, @attr.merge({:account => @account}))
        
        @vertical1 = FactoryGirl.create(:vertical, :account => @account)
        @vertical2 = FactoryGirl.create(:vertical, :account => @account)
        @vertical3 = FactoryGirl.create(:vertical, :account => @account)

        @dashboard1 = FactoryGirl.create(:dashboard, :vertical => @vertical1) 
        @dashboard2 = FactoryGirl.create(:dashboard, :vertical => @vertical2) 

        @permission1 = FactoryGirl.create(:permission, :permissible => @vertical1, :user => @user, :role => 'basic')
        @permission2 = FactoryGirl.create(:permission, :permissible => @dashboard1, :user => @user, :role => 'basic')
        @permission3 = FactoryGirl.create(:permission, :permissible => @dashboard2, :user => @user, :role => 'basic')

        @user_verticals = @user.verticals
      end


      it "should return 2 verticals" do
        expect(@user_verticals.length).to eq(2)
      end
    end

    describe "for a super admin user" do
      before(:each) do
        @attr[:is_admin] = true
        @account = FactoryGirl.create(:account)
        @user = FactoryGirl.create(:user, @attr.merge({:account => @account}))
        
        @vertical1 = FactoryGirl.create(:vertical, :account => @account)
        @vertical2 = FactoryGirl.create(:vertical, :account => @account)
        @vertical3 = FactoryGirl.create(:vertical, :account => @account)
        @vertical4 = FactoryGirl.create(:vertical, :account => FactoryGirl.create(:account))


        @dashboard1 = FactoryGirl.create(:dashboard, :vertical => @vertical1) 
        @dashboard2 = FactoryGirl.create(:dashboard, :vertical => @vertical2) 

        @permission1 = FactoryGirl.create(:permission, :permissible => @vertical1, :user => @user, :role => 'basic')
        @permission2 = FactoryGirl.create(:permission, :permissible => @dashboard1, :user => @user, :role => 'basic')
        @permission3 = FactoryGirl.create(:permission, :permissible => @dashboard2, :user => @user, :role => 'basic')

        @user_verticals = @user.verticals
      end

      it "should return 3 verticals" do
        expect(@user_verticals.length).to eq(3)
      end
    end
  end

  describe "#user_permissions" do
    before(:each) do
      @account = FactoryGirl.create(:account)
      @user = FactoryGirl.create(:user, @attr)
      User.stub(:current_user).and_return(@user)   
      @vertical1 = FactoryGirl.create(:vertical, :account => @account)
      @vertical2 = FactoryGirl.create(:vertical, :account => @account)
      @vertical3 = FactoryGirl.create(:vertical, :account => @account)

      @dashboard1 = FactoryGirl.create(:dashboard, :vertical => @vertical1) 
      @dashboard2 = FactoryGirl.create(:dashboard, :vertical => @vertical2) 

      # Vertical 1
      @permission1 = FactoryGirl.create(:permission, :permissible => @vertical1, :user => @user, :role => 'manager')
      # Vertical 1, Dashboard 1
      @permission2 = FactoryGirl.create(:permission, :permissible => @dashboard1, :user => @user, :role => 'basic')
      
      # Vertical 2, Dashboard 2
      @permission3 = FactoryGirl.create(:permission, :permissible => @dashboard2, :user => @user, :role => 'admin')
      @user_permissions = @user.create_and_get_user_permissions

      @expected_permissions_map = {
        "Vertical" => [
          {:permissible_id => @vertical1.id, :role => @permission1.role, :permissible => @vertical1},
          {:permissible_id => @vertical2.id, :role => "basic", :permissible => @vertical2},
        ],
        "Dashboard" => [
          {:permissible_id => @dashboard1.id, :role => @permission1.role, :permissible => @dashboard1},
          {:permissible_id => @dashboard2.id, :role => @permission3.role, :permissible => @dashboard2},
        ]
      }
    end

    it "Should return permission map of length 2" do
      expect(@user_permissions.length).to eq(2)
    end

    it "Should return correct permissions map" do
      expect(@user_permissions).to eq(@expected_permissions_map)
    end

    it "Should only return own user permissions in json format" do
      expect(@user.user_permissions).to eq(@expected_permissions_map.to_json)
    end 
  end

  describe "#company_logo_url" do
    before(:each) do
        @user = FactoryGirl.create(:user, @attr)       
    end

    it "Should return company logo url" do
      expect(@user.company_logo_url).to eq("/assets/logo_long.png")
    end

    it "Should return correct logo width" do
      account = FactoryGirl.create(:account)
      user = FactoryGirl.create(:user, @attr.merge({:email => 'testUser@gmail.com', :account => account}))         
      account.account_setting.update_attributes(:logo_width => 157)
      expect(user.logo_width).to eq(157)
    end
  end

  describe "#get_user_filters" do
    before(:each) do
      @account = FactoryGirl.create(:account)
      @user = FactoryGirl.create(:user, @attr.merge({:account => @account}))
      @data_source = FactoryGirl.create(:data_source, :account => @account)
      @user_filter = FactoryGirl.create(:user_filter, :user => @user, :data_source => @data_source)
    end

    it "Should return correct logo width" do
      expect(@user.get_user_filters(@data_source.id)).to eq([{"fieldName"=>"field name", "formatAs"=>"sum", "dataType"=>"string", "comparision"=>"IN", "value"=>[]}])
    end
  end

  describe "#get_excluded_data_sources" do
    before(:each) do
      @account = FactoryGirl.create(:account)
      @user = FactoryGirl.create(:user, @attr.merge({:account => @account}))
      @data_source = FactoryGirl.create(:data_source, :account => @account)
      @user_filter = FactoryGirl.create(:user_filter, :user => @user, :data_source => @data_source, :hide => true)
    end

    it "Should return array of excluded data sources" do
      @data_source2 = FactoryGirl.create(:data_source, :account => @account)
      @user_filter = FactoryGirl.create(:user_filter, :user => @user, :data_source => @data_source2, :hide => true)
      expect(@user.get_excluded_data_sources).to eq([@data_source,@data_source2])
    end
  end  

  describe "#current_user" do
    before(:each) do
      @account = FactoryGirl.create(:account)
      @user = FactoryGirl.create(:user, @attr.merge({:account => @account}))  
    end

    it "Should set current user" do
      expect(User.current_user = @user).to eq(@user)
    end

    it "Should should return current user" do
      expect(User.current_user).to eq(@user)
    end    
  end 

  describe "#check_limit" do
    describe "for admin user" do
      before(:each) do
        @account = FactoryGirl.create(:account, :admin_users_limit => 2)
        @user = FactoryGirl.create(:user, {:account => @account, :is_admin => true})  
      end

      it "Should return true if admin user limit is not reached" do
        expect(@user.check_limit).to eq(true)
      end
     
      it "Should return false if admin user limit is reached" do
        @user = FactoryGirl.create(:user, {:account => @account, :is_admin => true})  
        expect(@user.check_limit).to eq(false)
      end 
    end  

    describe "for basic user" do
      before(:each) do
        @account = FactoryGirl.create(:account, :basic_users_limit => 2)
        @user = FactoryGirl.create(:user, {:account => @account, :is_admin => false})  
      end

      it "Should return true if admin user limit is not reached" do
        expect(@user.check_limit).to eq(true)
      end
     
      it "Should return false if admin user limit is reached" do
        @user = FactoryGirl.create(:user, {:account => @account, :is_admin => false})  
        expect(@user.check_limit).to eq(false)
      end 
    end      
  end    

end
