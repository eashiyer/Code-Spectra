require 'spec_helper'

describe "Charts :" do
  describe "POST /charts" do
    it "creates chart" do
      chart = FactoryGirl.create(:chart)
      post charts_path, chart: FactoryGirl.attributes_for(:chart)
	  response.should be_successful
    end

    it "updates chart" do
    	chart = Chart.first
    	post charts_path chart, chart: { width: 1000 }
    	response.should be_successful
    end
  end

  describe "GET /charts" do
  	it "fetches all charts" do
  		charts = Chart.all
  		get charts_path
  		response.should be_successful
  	end
  end

 #  describe "Something" do
	# it "does something"
 
 #  	it "does something I haven't implemented yet"
	
 #  end
end
