require 'spec_helper'

describe Measure do
	before(:each) do    
	    @measure = FactoryGirl.create(:measure,
	    							  :field_name => 'test field name',
	    							  :format_as => 'format',
	    							  :display_name => 'display name')
	end	

  	it "should return fact map" do
		expect(@measure.get_fact_map_entry).to eq({
			"fieldName" => 'test field name',
			"formatAs" => 'format',
			"displayName" => 'display name',
		})
	end
end
