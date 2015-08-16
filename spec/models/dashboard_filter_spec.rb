require 'spec_helper'

describe DashboardFilter do
	it { should belong_to(:dashboard) }

 	before(:each) do
	  	@account = FactoryGirl.create(:account)
  		@vertical = FactoryGirl.create(:vertical, :account => @account)
 		@dashboard = FactoryGirl.create(:dashboard, :vertical => @vertical)
 		@dashboard_filter = FactoryGirl.create(:dashboard_filter, :dashboard => @dashboard)
 	end

 	describe ".operator_type" do
 		it "should return operator type" do
 			expect(DashboardFilter.operator_type('in')).to eql(0)
 			expect(DashboardFilter.operator_type('lt')).to eql(1)
 			expect(DashboardFilter.operator_type('gt')).to eql(2)
 			expect(DashboardFilter.operator_type('not in')).to eql(3)
 		end
 	end

 	describe ".operator" do
 		it "should return operator type" do
 			expect(DashboardFilter.operator(0)).to eql('in')
 			expect(DashboardFilter.operator(1)).to eql('lt')
 			expect(DashboardFilter.operator(2)).to eql('gt')
 			expect(DashboardFilter.operator(3)).to eql('not in')
 		end
 	end 

 	describe "#get_months_index" do
 		it "should return proper index of month" do
 			expect(@dashboard_filter.get_months_index(['January','December'])).to eql([1,12])
 		end
 	end	

 	describe "#get_operator" do
 		it "should return 'IN' when comparison operator is 0" do
 			dashboard_filter = FactoryGirl.create(:dashboard_filter, :comparison_operator => 0, :dashboard => @dashboard)
 			expect(dashboard_filter.get_operator).to eql('IN')
 		end

 		it "should return '<' when comparison operator is 1" do
 			dashboard_filter = FactoryGirl.create(:dashboard_filter, :comparison_operator => 1, :dashboard => @dashboard)
 			expect(dashboard_filter.get_operator).to eql('<')
 		end 		

 		it "should return '>' when comparison operator is 2" do
 			dashboard_filter = FactoryGirl.create(:dashboard_filter, :comparison_operator => 2, :dashboard => @dashboard)
 			expect(dashboard_filter.get_operator).to eql('>')
 		end

 		it "should return 'Not In' when comparison operator is 3" do
 			dashboard_filter = FactoryGirl.create(:dashboard_filter, :comparison_operator => 3, :dashboard => @dashboard)
 			expect(dashboard_filter.get_operator).to eql('NOT IN')
 		end

 		it "should return 'IS NOT NULL' when comparison operator is 4" do
 			dashboard_filter = FactoryGirl.create(:dashboard_filter, :comparison_operator => 4, :dashboard => @dashboard)
 			expect(dashboard_filter.get_operator).to eql('IS NOT NULL')
 		end

 		it "should return 'IN' when comparison operator is not in 0 and 4" do
 			dashboard_filter = FactoryGirl.create(:dashboard_filter, :comparison_operator => 5, :dashboard => @dashboard)
 			expect(dashboard_filter.get_operator).to eql('IN')
 		end 		
 	end

 	describe "#get_filter_values" do
 		it "should return array of string when comparison operator is 0" do
 			field_vals = (['xxx','yyy']).to_json
 			dashboard_filter = FactoryGirl.create(:dashboard_filter, :field_values => field_vals, :comparison_operator => 0, :dashboard => @dashboard)
 			expect(dashboard_filter.get_filter_values).to eql(['xxx','yyy'])
 		end

 		it "should return array of string when comparison operator is 3" do
 			field_vals = (['xxx','yyy']).to_json
 			dashboard_filter = FactoryGirl.create(:dashboard_filter, :field_values => field_vals, :comparison_operator => 3, :dashboard => @dashboard)
 			expect(dashboard_filter.get_filter_values).to eql(['xxx','yyy'])
 		end

 		it "should return array of string when comparison operator is 4" do
 			field_vals = (['xxx','yyy']).to_json
 			dashboard_filter = FactoryGirl.create(:dashboard_filter, :field_values => field_vals, :comparison_operator => 4, :dashboard => @dashboard)
 			expect(dashboard_filter.get_filter_values).to eql(['xxx','yyy'])
 		end

 		it "should return array of integers when comparison operator is 1" do
 			field_vals = ("3000").to_json
 			dashboard_filter = FactoryGirl.create(:dashboard_filter, :field_values => field_vals, :comparison_operator => 1, :dashboard => @dashboard)
 			expect(dashboard_filter.get_filter_values).to eql(3000)
 		end

 		it "should return array of integers when comparison operator is 2" do
 			field_vals = ("1000").to_json
 			dashboard_filter = FactoryGirl.create(:dashboard_filter, :field_values => field_vals, :comparison_operator => 2, :dashboard => @dashboard)
 			expect(dashboard_filter.get_filter_values).to eql(1000)
 		end 

 		it "should return nil if no field_values" do
 			dashboard_filter = FactoryGirl.create(:dashboard_filter, :field_values => nil, :comparison_operator => 4, :dashboard => @dashboard)
 			expect(dashboard_filter.get_filter_values).to eql(nil)
 		end  				 		
 	end 

 	describe "#get_condition" do

 		it "should return conditions array" do
 			expected_val = [{"fieldName"=>"field name", "formatAs"=>"sum", "dataType"=>"string", "comparision"=>"IN", "value"=>[]}]
 			dashboard_filter = FactoryGirl.create(:dashboard_filter, :comparison_operator => 5, :dashboard => @dashboard)
 			expect(dashboard_filter.get_condition).to eql(expected_val)
 		end 

 		describe "for month" do
	 		it "should return conditions array when format_as is 'Month'" do
	 			expected_val = [{"fieldName"=>"field name", "formatAs"=>"Month", "dataType"=>"string", "comparision"=>"IN", "value"=>[1, 2]}]
	 			field_vals = (['January','February']).to_json
	 			dashboard_filter = FactoryGirl.create(:dashboard_filter, :field_values => field_vals, :comparison_operator => 5, :format_as => 'Month', :dashboard => @dashboard)
	 			expect(dashboard_filter.get_condition).to eql(expected_val)
	 		end 

	 		it "should return range conditions when comparison operator is 5 and date range is true" do 			
	 			field_vals = (['January','February']).to_json
	 			dashboard_filter = FactoryGirl.create(:dashboard_filter, :field_values => field_vals, :comparison_operator => 5, :date_range => true, :lower_range => '02/03/2011'.to_date, :upper_range => '02/10/2011'.to_date, :format_as => 'Month', :dashboard => @dashboard)
	 			expected_val = [{"fieldName"=>"field name", "formatAs"=>"Month", "dataType"=>"string", "comparision"=>">", "value"=>dashboard_filter.lower_range}, {"fieldName"=>"field name", "formatAs"=>"Month", "dataType"=>"string", "comparision"=>"<", "value"=>dashboard_filter.upper_range}]
	 			expect(dashboard_filter.get_condition).to eql(expected_val)
	 		end  

	 		it "should return range conditions when comparison operator is 5 and date range is false" do 			
	 			field_vals = (['January','February']).to_json
	 			dashboard_filter = FactoryGirl.create(:dashboard_filter, :field_values => field_vals, :comparison_operator => 5, :date_range => false, :reference_date => nil, :reference_unit => 'Months', :reference_date_today => true, :reference_count => 3, :format_as => 'Month', :dashboard => @dashboard)
	 			expected_val = [{"fieldName"=>"field name", "formatAs"=>"Month", "dataType"=>"string", "comparision"=>">", "value"=>Date.today}, {"fieldName"=>"field name", "formatAs"=>"Month", "dataType"=>"string", "comparision"=>"<", "value"=>Date.today + 3.months}]
	 			expect(dashboard_filter.get_condition).to eql(expected_val)
	 		end 	 			 		
 		end

 		describe "for month year" do
	 		it "should return conditions array when format_as is 'Month Year'" do
	 			expected_val = [{"fieldName"=>"field name", "formatAs"=>"Month Year", "dataType"=>"string", "comparision"=>"IN", "value"=>["2011 07", "2011 03"]}]
	 			field_vals = (['2011 Jul','2011 Mar']).to_json
	 			dashboard_filter = FactoryGirl.create(:dashboard_filter, :field_values => field_vals, :comparison_operator => 5, :format_as => 'Month Year', :dashboard => @dashboard)
	 			expect(dashboard_filter.get_condition).to eql(expected_val)
	 		end 
 		end


 		describe "for Quarter" do
	 		it "should return conditions array when format_as is 'Month Year'" do
	 			expected_val = [{"fieldName"=>"field name", "formatAs"=>"Quarter", "dataType"=>"string", "comparision"=>"IN", "value"=>["2011 Jul", "2011 Mar"]}]
	 			field_vals = (['2011 Jul','2011 Mar']).to_json
	 			dashboard_filter = FactoryGirl.create(:dashboard_filter, :field_values => field_vals, :comparison_operator => 5, :format_as => 'Quarter', :dashboard => @dashboard)
	 			expect(dashboard_filter.get_condition).to eql(expected_val)
	 		end 
 		end 		

 		describe "for year" do
	 		it "should return range conditions when comparison operator is 5 and format_as is not month or month_year and date range is false" do 			
	 			field_vals = (['January','February']).to_json
	 			dashboard_filter = FactoryGirl.create(:dashboard_filter, :field_values => field_vals, :comparison_operator => 5, :date_range => false, :reference_date => '02/03/2011'.to_date, :reference_unit => 'Years', :reference_date_today => false, :reference_count => 3, :format_as => 'Year', :dashboard => @dashboard)
	 			expected_val = [{"fieldName"=>"field name", "formatAs"=>"Year", "dataType"=>"string", "comparision"=>">", "value"=>dashboard_filter.reference_date}, {"fieldName"=>"field name", "formatAs"=>"Year", "dataType"=>"string", "comparision"=>"<", "value"=>dashboard_filter.reference_date + 3.years}]
	 			expect(dashboard_filter.get_condition).to eql(expected_val)
	 		end  

	 		it "should return range conditions when comparison operator is 5 and format_as is not month or month_year and date range is false" do 			
	 			field_vals = (['January','February']).to_json
	 			dashboard_filter = FactoryGirl.create(:dashboard_filter, :field_values => field_vals, :comparison_operator => 5, :date_range => true, :reference_date => '02/03/2011'.to_date, :reference_unit => 'Years', :reference_date_today => false, :reference_count => 3, :format_as => 'Year', :dashboard => @dashboard)
	 			expected_val = [{"fieldName"=>"field name", "formatAs"=>"Year", "dataType"=>"string", "comparision"=>">", "value"=>nil}, {"fieldName"=>"field name", "formatAs"=>"Year", "dataType"=>"string", "comparision"=>"<", "value"=>nil}]
	 			expect(dashboard_filter.get_condition).to eql(expected_val)
	 		end  	 		

 		end		
 	end 

 	describe "#get_reference_condition" do
 		it "should return conditionsMap for previous reference direction" do
 			field_vals = (['January','February']).to_json
 			dashboard_filter = FactoryGirl.create(:dashboard_filter, :field_values => field_vals, :comparison_operator => 5, :date_range => false, :reference_date => nil, :reference_unit => 'Months', :reference_direction => 'previous', :reference_date_today => true, :reference_count => 3, :format_as => 'Month', :dashboard => @dashboard)
 			expected_val = [{"fieldName"=>"field name", "formatAs"=>"Month", "dataType"=>"string", "comparision"=>">", "value"=>Date.today - 3.months}, {"fieldName"=>"field name", "formatAs"=>"Month", "dataType"=>"string", "comparision"=>"<", "value"=>Date.today}]
 			expect(dashboard_filter.get_condition).to eql(expected_val)
 		end

 		it "should return conditionsMap for next reference direction" do
 			field_vals = (['January','February']).to_json
 			dashboard_filter = FactoryGirl.create(:dashboard_filter, :field_values => field_vals, :comparison_operator => 5, :date_range => false, :reference_date => nil, :reference_unit => 'Months', :reference_direction => 'next', :reference_date_today => true, :reference_count => 3, :format_as => 'Month', :dashboard => @dashboard)
 			expected_val = [{"fieldName"=>"field name", "formatAs"=>"Month", "dataType"=>"string", "comparision"=>">", "value"=>Date.today}, {"fieldName"=>"field name", "formatAs"=>"Month", "dataType"=>"string", "comparision"=>"<", "value"=>Date.today+3.months}]
 			expect(dashboard_filter.get_condition).to eql(expected_val)
 		end 		
 	end		
end

