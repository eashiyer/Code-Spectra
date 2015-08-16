require 'spec_helper'

describe "#get_date_specifier" do
	describe "When called with mm/dd/yy format" do
		before do
			@specifier = DateTimeFormatParser.get_date_specifier("03/02/13", "Month, Day, Year")
		end
		it "should return %m/%d/%y" do			
			@specifier.should eq("%m/%d/%y")
		end
	end

	describe "When called with m/dd/yy format" do
		before do
			@specifier = DateTimeFormatParser.get_date_specifier("3/02/13", "Month, Day, Year")
		end
		it "should return %m/%d/%y" do			
			@specifier.should eq("%m/%d/%y")
		end
	end

	describe "When called with mon/dd/yy format" do
		before do
			@specifier = DateTimeFormatParser.get_date_specifier("Feb/02/13", "Month, Day, Year")
		end
		it "should return %b/%d/%y" do			
			@specifier.should eq("%b/%d/%y")
		end
	end

	describe "When called with dd/mm/yy format" do
		before do
			@specifier = DateTimeFormatParser.get_date_specifier("03/02/13", "Day, Month, Year")
		end
		it "should return %d/%m/%y" do			
			@specifier.should eq("%d/%m/%y")
		end
	end

	describe "When called with d/m/yy format" do
		before do
			@specifier = DateTimeFormatParser.get_date_specifier("3/2/13", "Day, Month, Year")
		end
		it "should return %d/%m/%y" do			
			@specifier.should eq("%d/%m/%y")
		end
	end

	describe "When called with yyyy/mm/dd format" do
		before do
			@specifier = DateTimeFormatParser.get_date_specifier("2013/02/13", "Year, Month, Day")
		end
		it "should return %Y/%m/%d" do			
			@specifier.should eq("%Y/%m/%d")
		end
	end

	describe "When called with yy/mm/dd format" do
		before do
			@specifier = DateTimeFormatParser.get_date_specifier("13/02/13", "Year, Month, Day")
		end
		it "should return %y/%m/%d" do			
			@specifier.should eq("%y/%m/%d")
		end
	end

	describe "When called with wrong format" do
		before do
			@specifier = DateTimeFormatParser.get_date_specifier("13/02/13", "Year")
		end
		it "should return false" do			
			@specifier.should eq(false)
		end
	end	
end

describe "#get_formatted_date" do
	describe "When called with mm/dd/yy format" do
		it "should return %m/%d/%y" do	
			@formatted_date = DateTimeFormatParser.get_formatted_date("03/02/13", "Month, Day, Year")		
			@formatted_date.should eq("2013/03/02")
		end
	end

	describe "When called with m/dd/yy format" do
		it "should return %m/%d/%y" do
			@formatted_date = DateTimeFormatParser.get_formatted_date("3/02/13", "Month, Day, Year")			
			@formatted_date.should eq("2013/03/02")
		end
	end

	describe "When called with mon/dd/yy format" do
		it "should return %b/%d/%y" do		
			@formatted_date = DateTimeFormatParser.get_formatted_date("Feb/02/13", "Month, Day, Year")	
			@formatted_date.should eq("2013/02/02")
		end
	end

	describe "When called with dd/mm/yy format" do
		it "should return %d/%m/%y" do		
			@formatted_date = DateTimeFormatParser.get_formatted_date("03/02/13", "Day, Month, Year")	
			@formatted_date.should eq("2013/02/03")
		end
	end

	describe "When called with d/m/yy format" do
		it "should return %d/%m/%y" do		
			@formatted_date = DateTimeFormatParser.get_formatted_date("3/2/13", "Day, Month, Year")	
			@formatted_date.should eq("2013/02/03")
		end
	end

	describe "When called with yyyy/mm/dd format" do
		it "should return %Y/%m/%d" do	
			@formatted_date = DateTimeFormatParser.get_formatted_date("2013/02/13", "Year, Month, Day")		
			@formatted_date.should eq("2013/02/13")
		end
	end

	describe "When called with yy/mm/dd format" do
		it "should return %y/%m/%d" do
			@formatted_date = DateTimeFormatParser.get_formatted_date("13/02/13", "Year, Month, Day")			
			@formatted_date.should eq("2013/02/13")
		end
	end
end

describe "#get_formatted_time" do
	it "should return formated time for hh:mm format" do
		format = {"time_format" => 'hh:mm'}
		@formatted_date = DateTimeFormatParser.get_formatted_time("01:30", format)			
		@formatted_date.should eq("01:30:00")
	end

	it "should return formated time for hh:mm:ss format" do
		format = {"time_format" => 'hh:mm:ss'}
		@formatted_date = DateTimeFormatParser.get_formatted_time("01:30:33", format)			
		@formatted_date.should eq("01:30:33")
	end

	it "should return formated time for h:m AM/PM format" do
		format = {"time_format" => 'hh:mm AM/PM'}
		@formatted_date = DateTimeFormatParser.get_formatted_time("01:30 AM", format)			
		@formatted_date.should eq("01:30:00")
	end

	it "should return formated time for h:m:s AM/PM format" do
		format = {"time_format" => 'hh:mm:ss AM/PM'}
		@formatted_date = DateTimeFormatParser.get_formatted_time("01:30:33 PM", format)			
		@formatted_date.should eq("13:30:33")
	end			
end

describe "#get_formatted_datetime" do
	it "should return formated date time for 'Month, Day, Year hh:mm' format" do
		format = {"date_format" => "Month, Day, Year", "time_format" => 'hh:mm'}
		@formatted_date = DateTimeFormatParser.get_formatted_datetime("03/02/13 01:30", format)			
		@formatted_date.should eq("2013/03/02 01:30:00")
	end		

	it "should return formated datetime for 'Month, Day, Year hh:mm:ss' format" do
		format = {"date_format" => "Month, Day, Year", "time_format" => 'hh:mm:ss'}
		@formatted_date = DateTimeFormatParser.get_formatted_datetime("03/02/13 01:30:14", format)			
		@formatted_date.should eq("2013/03/02 01:30:14")
	end	

	it "should return formated datetime for 'Month, Day, Year hh:mm:ss AM?PM' format" do
		format = {"date_format" => "Month, Day, Year", "time_format" => 'hh:mm AM/PM'}
		@formatted_date = DateTimeFormatParser.get_formatted_datetime("03/02/13 01:30 AM", format)			
		@formatted_date.should eq("2013/03/02 01:30:00")
	end	

	it "should return formated datetime for  Day, Month, Year hh:mm:ss' format" do
		format = {"date_format" => "Day, Month, Year", "time_format" => 'hh:mm:ss'}
		@formatted_date = DateTimeFormatParser.get_formatted_datetime("03/02/13 01:30:14", format)			
		@formatted_date.should eq("2013/02/03 01:30:14")
	end				
end

describe "#get_seperator" do
	it "should return '/' seperator for a date string having '/'" do
		format = {"date_format" => "Month, Day, Year", "time_format" => 'hh:mm'}
		@formatted_date = DateTimeFormatParser.get_seperator("03/02/13")			
		@formatted_date.should eq("/")
	end		

	it "should return '-' seperator for a date string having '-'" do
		@formatted_date = DateTimeFormatParser.get_seperator("03-02-13")			
		@formatted_date.should eq("-")
	end	

	it "should return return nil if seperator is not - or /" do
		@formatted_date = DateTimeFormatParser.get_seperator("03_02_13")			
		@formatted_date.should be_nil
	end				
end