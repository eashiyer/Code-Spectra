require 'spec_helper'

describe Dimension do
	before(:each) do    
	    @dimension = FactoryGirl.create(:dimension,
	    							  :field_name => 'test field name',
	    							  :format_as => 'format',
	    							  :display_name => 'display name')
	end	

  	it "should return dimension map" do
		expect(@dimension.get_dimension_map_entry).to eq({
			"fieldName" => 'test field name',
			"formatAs" => 'format',
			"displayName" => 'display name',
		})
	end
end
