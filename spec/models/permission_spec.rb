require 'spec_helper'

describe Permission do
	it { should belong_to(:user) }
	it { should belong_to(:permissible) }

	describe "create & check permissions" do
		before(:each) do
			@account = FactoryGirl.create(:account)
			@vertical = FactoryGirl.create(:vertical)
			@user = FactoryGirl.create(:user, :account => @account)
			@dashboard =  FactoryGirl.create(:dashboard, :vertical => @vertical)
			@permission = FactoryGirl.create(:permission, :user => @user, :permissible => @dashboard)
		end

		it "should have permissible type as Dashboard" do
			@permission.permissible.should be(@dashboard)
		end

		it " dashboard should have correct permissions" do
			@dashboard.permissions[0].id.should be(@permission.id)
		end
	end

	describe "#can_perform?" do
		describe " with admin role " do
			before(:each) do
				@account = FactoryGirl.create(:account)
				@vertical = FactoryGirl.create(:vertical)
				@user = FactoryGirl.create(:user, :account => @account)
				@dashboard =  FactoryGirl.create(:dashboard, :vertical => @vertical)
				@permission = FactoryGirl.create(:permission, 
					:user => @user, 
					:permissible => @dashboard,
					:role => 'admin')
			end

			it "should be defined" do
				expect { @permission.can_perform?("create") }.to_not raise_error
			end

			it "should return correct permissions" do
				expect(@permission.can_perform?("create")).to be(true)
			end
		end

		describe 'with manager role' do
			before(:each) do
				@account = FactoryGirl.create(:account)
				@vertical = FactoryGirl.create(:vertical)
				@user = FactoryGirl.create(:user, :account => @account)
				@dashboard =  FactoryGirl.create(:dashboard, :vertical => @vertical)
				@permission = FactoryGirl.create(:permission, 
					:user => @user, 
					:permissible => @dashboard,
					:role => 'manager')
			end

			it "should return correct permissions" do
				expect(@permission.can_perform?("destroy")).to be(false)
			end

			it "should return correct permissions" do
				expect(@permission.can_perform?("create")).to be(true)
			end

			it "should return correct permissions" do
				expect(@permission.can_perform?("update")).to be(true)
			end
		end

		describe 'with basic role' do
			before(:each) do
				@account = FactoryGirl.create(:account)
				@vertical = FactoryGirl.create(:vertical)
				@user = FactoryGirl.create(:user, :account => @account)
				@dashboard =  FactoryGirl.create(:dashboard, :vertical => @vertical)
				@permission = FactoryGirl.create(:permission, 
					:user => @user, 
					:permissible => @dashboard,
					:role => 'basic')
			end

			it "should return correct permissions" do
				expect(@permission.can_perform?("destroy")).to be(false)
			end

			it "should return correct permissions" do
				expect(@permission.can_perform?("create")).to be(false)
			end

			it "should return correct permissions" do
				expect(@permission.can_perform?("update")).to be(false)
			end

			it "should return correct permissions" do
				expect(@permission.can_perform?("show")).to be(true)
			end

			it "should return correct permissions" do
				expect(@permission.can_perform?("index")).to be(true)
			end

		end
	end

	describe "#get_permissibles_hierarchy" do
		it "should return correct hierarchy" do
			hierarchy = Permission::get_permissibles_hierarchy
			expect(hierarchy[0]).to eq("Vertical")
			expect(hierarchy[1]).to eq("Dashboard")
		end

		it "should return correct hierarchy" do
			hierarchy = Permission::get_permissibles_hierarchy("Dashboard")
			expect(hierarchy[0]).to eq("Vertical")
		end

		it "should return correct hierarchy" do
			hierarchy = Permission::get_permissibles_hierarchy("Vertical")
			expect(hierarchy).to eq([])
		end
	end

	describe "#preceding_role" do
		it "should return correct hierarchy" do
			preceding_role = Permission::preceding_role("basic", "manager")
			expect(preceding_role).to eq("manager")
		end

		it "should return correct hierarchy" do
			preceding_role = Permission::preceding_role("admin", "manager")
			expect(preceding_role).to eq("admin")
		end

		it "should return correct hierarchy" do
			preceding_role = Permission::preceding_role("basic", "admin")
			expect(preceding_role).to eq("admin")
		end
	end

	describe "#role_can_perform?" do
		describe " with admin role " do
			it "should be defined" do
				expect { Permission.role_can_perform?("admin","create") }.to_not raise_error
			end

			it "should return correct permissions" do
				expect(Permission.role_can_perform?("admin","create")).to be(true)
				expect(Permission.role_can_perform?("admin","index")).to be(true)
				expect(Permission.role_can_perform?("admin","update")).to be(true)
				expect(Permission.role_can_perform?("admin","show")).to be(true)
				expect(Permission.role_can_perform?("admin","destroy")).to be(true)
			end
		end

		describe 'with manager role' do
			it "should return correct permissions" do
				expect(Permission.role_can_perform?("manager","destroy")).to be(false)
				expect(Permission.role_can_perform?("manager","create")).to be(true)
				expect(Permission.role_can_perform?("manager","update")).to be(true)
				expect(Permission.role_can_perform?("manager","show")).to be(true)
				expect(Permission.role_can_perform?("manager","index")).to be(true)				
			end
		end

		describe 'with basic role' do
			it "should return correct permissions" do
				expect(Permission.role_can_perform?("basic","destroy")).to be(false)
				expect(Permission.role_can_perform?("basic","create")).to be(false)
				expect(Permission.role_can_perform?("basic","update")).to be(false)
				expect(Permission.role_can_perform?("basic","show")).to be(true)
				expect(Permission.role_can_perform?("basic","index")).to be(true)				
			end

		end
	end

end
