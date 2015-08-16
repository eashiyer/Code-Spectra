require 'spec_helper'

describe UserFilter do
	it { should belong_to(:user) }
 	it { should belong_to(:data_source) }

 	it { should validate_presence_of(:data_source_id) }
 	it { should validate_presence_of(:user_id) }

 	before(:each) do
 		@account = FactoryGirl.create(:account) 
 		@user = FactoryGirl.create(:user, :account => @account)
 		@data_source = FactoryGirl.create(:data_source)
 		@user_filter = FactoryGirl.create(:user_filter, :user => @user, :data_source => @data_source)
 	end

 	describe ".operator_type" do
 		it "should return operator type" do
 			expect(UserFilter.operator_type('in')).to eql(0)
 			expect(UserFilter.operator_type('lt')).to eql(1)
 			expect(UserFilter.operator_type('gt')).to eql(2)
 			expect(UserFilter.operator_type('not in')).to eql(3)
 			expect(UserFilter.operator_type('not null')).to eql(4)
 		end
 	end

 	describe ".operator" do
 		it "should return operator type" do
 			expect(UserFilter.operator(0)).to eql('in')
 			expect(UserFilter.operator(1)).to eql('lt')
 			expect(UserFilter.operator(2)).to eql('gt')
 			expect(UserFilter.operator(3)).to eql('not in')
 			expect(UserFilter.operator(4)).to eql('not null')
 		end
 	end 

 	describe "#get_months_index" do
 		it "should return proper index of month" do
 			expect(@user_filter.get_months_index(['January','December'])).to eql([1,12])
 		end
 	end	

 	describe "#get_operator" do
 		it "should return 'IN' when comparison operator is 0" do
 			user_filter = FactoryGirl.create(:user_filter, :comparison_operator => 0, :user => @user, :data_source => @data_source)
 			expect(user_filter.get_operator).to eql('IN')
 		end

 		it "should return '<' when comparison operator is 1" do
 			user_filter = FactoryGirl.create(:user_filter, :comparison_operator => 1, :user => @user, :data_source => @data_source)
 			expect(user_filter.get_operator).to eql('<')
 		end 		

 		it "should return '>' when comparison operator is 2" do
 			user_filter = FactoryGirl.create(:user_filter, :comparison_operator => 2, :user => @user, :data_source => @data_source)
 			expect(user_filter.get_operator).to eql('>')
 		end

 		it "should return 'Not In' when comparison operator is 3" do
 			user_filter = FactoryGirl.create(:user_filter, :comparison_operator => 3, :user => @user, :data_source => @data_source)
 			expect(user_filter.get_operator).to eql('NOT IN')
 		end

 		it "should return 'IS NOT NULL' when comparison operator is 4" do
 			user_filter = FactoryGirl.create(:user_filter, :comparison_operator => 4, :user => @user, :data_source => @data_source)
 			expect(user_filter.get_operator).to eql('IS NOT NULL')
 		end

 		it "should return 'IN' when comparison operator is not in 0 and 4" do
 			user_filter = FactoryGirl.create(:user_filter, :comparison_operator => 5, :user => @user, :data_source => @data_source)
 			expect(user_filter.get_operator).to eql('IN')
 		end 		
 	end

 	describe "#get_filter_values" do
 		it "should return array of string when comparison operator is 0" do
 			field_vals = (['xxx','yyy']).to_json
 			user_filter = FactoryGirl.create(:user_filter, :field_values => field_vals, :comparison_operator => 0, :user => @user, :data_source => @data_source)
 			expect(user_filter.get_filter_values).to eql(['xxx','yyy'])
 		end

 		it "should return array of string when comparison operator is 3" do
 			field_vals = (['xxx','yyy']).to_json
 			user_filter = FactoryGirl.create(:user_filter, :field_values => field_vals, :comparison_operator => 3, :user => @user, :data_source => @data_source)
 			expect(user_filter.get_filter_values).to eql(['xxx','yyy'])
 		end

 		it "should return array of string when comparison operator is 4" do
 			field_vals = (['xxx','yyy']).to_json
 			user_filter = FactoryGirl.create(:user_filter, :field_values => field_vals, :comparison_operator => 4, :user => @user, :data_source => @data_source)
 			expect(user_filter.get_filter_values).to eql(['xxx','yyy'])
 		end

 		it "should return array of integers when comparison operator is 1" do
 			field_vals = ("3000").to_json
 			user_filter = FactoryGirl.create(:user_filter, :field_values => field_vals, :comparison_operator => 1, :user => @user, :data_source => @data_source)
 			expect(user_filter.get_filter_values).to eql(3000)
 		end

 		it "should return array of integers when comparison operator is 2" do
 			field_vals = ("1000").to_json
 			user_filter = FactoryGirl.create(:user_filter, :field_values => field_vals, :comparison_operator => 2, :user => @user, :data_source => @data_source)
 			expect(user_filter.get_filter_values).to eql(1000)
 		end 

 		it "should return nil if no field_values" do
 			user_filter = FactoryGirl.create(:user_filter, :field_values => nil, :comparison_operator => 4, :user => @user, :data_source => @data_source)
 			expect(user_filter.get_filter_values).to eql(nil)
 		end  				 		
 	end

 	describe "#get_condition" do
 		it "should return conditions array" do
 			expected_val = [{"fieldName"=>"field name", "formatAs"=>"sum", "dataType"=>"string", "comparision"=>"IN", "value"=>[]}]
 			user_filter = FactoryGirl.create(:user_filter, :comparison_operator => 5, :user => @user, :data_source => @data_source)
 			expect(user_filter.get_condition).to eql(expected_val)
 		end 

 		it "should return conditions array when format_as is 'Month'" do
 			expected_val = [{"fieldName"=>"field name", "formatAs"=>"Month", "dataType"=>"string", "comparision"=>"IN", "value"=>[1, 2]}]
 			field_vals = (['January','February']).to_json
 			user_filter = FactoryGirl.create(:user_filter, :field_values => field_vals, :comparison_operator => 5, :format_as => 'Month', :user => @user, :data_source => @data_source)
 			expect(user_filter.get_condition).to eql(expected_val)
 		end 

 		it "should return conditions array when format_as is 'Month Year'" do
 			expected_val = [{"fieldName"=>"field name", "formatAs"=>"Month Year", "dataType"=>"string", "comparision"=>"IN", "value"=>["2011 7", "2011 3"]}]
 			field_vals = (['2011 Jul','2011 Mar']).to_json
 			user_filter = FactoryGirl.create(:user_filter, :field_values => field_vals, :comparison_operator => 5, :format_as => 'Month Year', :user => @user, :data_source => @data_source)
 			expect(user_filter.get_condition).to eql(expected_val)
 		end  		 		
 	end
end
