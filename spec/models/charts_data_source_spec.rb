require 'spec_helper'

describe ChartsDataSource do
	before(:each) do
    @chart_data = [{"Count of NECTABR"=>"270017","YEAR"=>"2000"},{"Count of NECTABR"=>"172139","YEAR"=>"2001"},{"Count of NECTABR"=>"173154","YEAR"=>"2002"},{"Count of NECTABR"=>"199784","YEAR"=>"2003"},{"Count of NECTABR"=>"224837","YEAR"=>"2004"}]
		@chart_data_response = [{"Count of NECTABR"=>"270017","YEAR"=>"2000"},{"Count of NECTABR"=>"172139","YEAR"=>"2001"},{"Count of NECTABR"=>"173154","YEAR"=>"2002"},{"Count of NECTABR"=>"199784","YEAR"=>"2003"},{"Count of NECTABR"=>"224837","YEAR"=>"2004"}]
    @result_and_column_total = ({"result"=>@chart_data_response, "row_totals"=>@chart_data_response, "column_totals" => @chart_data_response, "grand_totals" => @chart_data_response})
	end  

  it { should belong_to(:chart)}
  it { should belong_to(:data_source)}
  it { should validate_presence_of(:data_source_id) }

  describe "#raw_data" do
	before(:each) do
		@chart = FactoryGirl.create(:chart)
		@charts_data_source = FactoryGirl.create(:charts_data_source)
	end  	

	it "should return raw data" do
		Cibids.stub_chain(:new, :get_data).and_return([])
		Cibids.stub_chain(:new, :get_total).and_return(20)
		expect(@charts_data_source.raw_data(nil, nil, nil, nil, nil)).to eq([{"results" => [], "count" => 20}])
	end
  end

  describe "#formatted_value" do
  	describe "for quarter" do
  		it "should return proper date for quarter" do
  			expect(ChartsDataSource.formatted_value("02/02/14", 'Quarter')).to eq("2014Q1")
  		end

  		it "should return blank string on error" do
  			expect(ChartsDataSource.formatted_value("02-02-14", 'Quarter')).to eq("")
  		end  		
  	end

  	describe "for month" do
  		it "should return proper date for quarter" do
  			expect(ChartsDataSource.formatted_value("02/02/14", 'Month')).to eq("Feb")
  		end

  		it "should return blank string on error" do
  			expect(ChartsDataSource.formatted_value("02-02-14", 'Month')).to eq("")
  		end  		
  	end 

  	describe "for year" do
  		it "should return proper date for quarter" do
  			expect(ChartsDataSource.formatted_value("02/02/14", 'Year')).to eq("2014")
  		end

  		it "should return blank string on error" do
  			expect(ChartsDataSource.formatted_value("02-02-14", 'Year')).to eq("")
  		end  		
  	end  	

  	describe "for Month, Year" do
  		it "should return proper date for quarter" do
  			expect(ChartsDataSource.formatted_value("02/02/14", 'Month, Year')).to eq("Feb, 2014")
  		end

  		it "should return blank string on error" do
  			expect(ChartsDataSource.formatted_value("02-02-14", 'Month, Year')).to eq("")
  		end  		
  	end  

  	describe "for Date String" do
  		it "should return proper date for quarter" do
  			expect(ChartsDataSource.formatted_value("02/02/14", 'Date String')).to eq("2014/02/02")
  		end

  		it "should return blank string on error" do
  			expect(ChartsDataSource.formatted_value("02-02-14", 'Date String')).to eq("")
  		end  		
  	end    	   	 	 
  end

  describe "#get_condition_map" do
  	before(:each) do
  		@account = FactoryGirl.create(:account)
  		@user = FactoryGirl.create(:user, :account => @account)
  		User.stub(:current_user).and_return(@user) 
  		@chart = FactoryGirl.create(:chart)
  		@chart_filter = FactoryGirl.create(:chart_filter, :chart => @chart)
  		@vertical = FactoryGirl.create(:vertical, :account => @account)
  		@dashboard = FactoryGirl.create(:dashboard, :vertical => @vertical)
  		@dashboard_filter = FactoryGirl.create(:dashboard_filter, :dashboard => @dashboard)		
  		@charts_data_source = FactoryGirl.create(:charts_data_source, :chart => @chart)
  	end  

  	it "should return condition map" do  	
  		@charts_data_source.get_condition_map
  	end
  end

  describe "#chart_data" do
  	before(:each) do
  		@account = FactoryGirl.create(:account)
  		@user = FactoryGirl.create(:user, :account => @account)
  		User.stub(:current_user).and_return(@user) 
  		@chart = FactoryGirl.create(:chart)
  		@chart_filter = FactoryGirl.create(:chart_filter, :chart => @chart)
  		@vertical = FactoryGirl.create(:vertical, :account => @account)
  		@dashboard = FactoryGirl.create(:dashboard, :vertical => @vertical)
  		@dashboard_filter = FactoryGirl.create(:dashboard_filter, :dashboard => @dashboard)			
  	end  	

  	it "should return response if datasource fields are not empty" do
  		Cibids.stub_chain(:new, :get_data).and_return(@chart_data_response)
  		Cibids.stub_chain(:new, :get_total).and_return(20)
  		@data_source = FactoryGirl.create(:data_source, :fields_str => [{:name => "field name", :display_name => "display name", :datatype => "varchar",:options => {:string_length=>200}.to_json}].to_json)
  		@charts_data_source = FactoryGirl.create(:charts_data_source, :chart => @chart, :data_source => @data_source)
  		expect(@charts_data_source.chart_data(nil, nil, nil, nil, nil)).to eq(@chart_data_response)
  	end
		
    it "should generate a row map if chart type is 14" do
      Cibids.stub_chain(:new, :get_data).and_return(@chart_data_response)
      Cibids.stub_chain(:new, :get_total).and_return(20)
      @chart = FactoryGirl.create(:chart, :chart_type => 14)
      @data_source = FactoryGirl.create(:data_source, :fields_str => [{:name => "field name", :display_name => "display name", :datatype => "varchar",:options => {:string_length=>200}.to_json}].to_json)
      @charts_data_source = FactoryGirl.create(:charts_data_source, :chart => @chart, :data_source => @data_source)
      expect(@charts_data_source.chart_data(nil, nil, nil, nil, nil)).to eq(@result_and_column_total)
    end

    it "should generate a secondary conditions map" do
      Cibids.stub_chain(:new, :get_data).and_return(@chart_data_response)
      Cibids.stub_chain(:new, :get_total).and_return(20)
      @chart = FactoryGirl.create(:chart)
      @measure = FactoryGirl.create(:measure, :format_as => 'opspc', :chart => @chart)
      @dimension = FactoryGirl.create(:dimension, :chart => @chart)
      @data_source = FactoryGirl.create(:data_source, :fields_str => [{:name => "field name", :display_name => "display name", :datatype => "varchar",:options => {:string_length=>200}.to_json}].to_json)
      @charts_data_source = FactoryGirl.create(:charts_data_source, :chart => @chart, :data_source => @data_source)
      expect(@charts_data_source.chart_data(nil, nil, nil, nil, nil)).to eq(@chart_data_response)
    end 

    it "should return result and count if chart type is 7" do
      Cibids.stub_chain(:new, :get_data).and_return(@chart_data)
      Cibids.stub_chain(:new, :get_total).and_return(20)
      @chart = FactoryGirl.create(:chart, :chart_type => 7)
      @data_source = FactoryGirl.create(:data_source, :fields_str => [{:name => "field name", :display_name => "display name", :datatype => "varchar",:options => {:string_length=>200}.to_json}].to_json)
      @charts_data_source = FactoryGirl.create(:charts_data_source, :chart => @chart, :data_source => @data_source)
      expect(@charts_data_source.chart_data(nil, nil, nil, nil, nil)).to eq([{"results" => @chart_data, "count"=>20}])
    end       

    it "should return empty array if query result is not array " do
      Cibids.stub_chain(:new, :get_data).and_return({})
      Cibids.stub_chain(:new, :get_total).and_return(20)
      @chart = FactoryGirl.create(:chart, :chart_type => 7)
      @data_source = FactoryGirl.create(:data_source, :fields_str => [{:name => "field name", :display_name => "display name", :datatype => "varchar",:options => {:string_length=>200}.to_json}].to_json)
      @charts_data_source = FactoryGirl.create(:charts_data_source, :chart => @chart, :data_source => @data_source)
      expect(@charts_data_source.chart_data(nil, nil, nil, nil, nil)).to eq([])
    end      

    it "should return empty if datasource fields are empty" do
      @data_source = FactoryGirl.create(:data_source)
      @charts_data_source = FactoryGirl.create(:charts_data_source, :chart => @chart, :data_source => @data_source)
      expect(@charts_data_source.chart_data(nil, nil, nil, nil, nil)).to eq([])
    end           
  end

  describe "different generators" do
    before(:each) do
      @account = FactoryGirl.create(:account)
      @user = FactoryGirl.create(:user, :account => @account)
      User.stub(:current_user).and_return(@user) 
    end 

    it "should generate a row map" do
      @chart = FactoryGirl.create(:chart)
      @measure = FactoryGirl.create(:measure, :format_as => 'opspc', :chart => @chart)
      @dimension = FactoryGirl.create(:dimension, :chart => @chart, :is_row => true)  
      @dimension2 = FactoryGirl.create(:dimension, :chart => @chart, :is_row => true)  
      @data_source = FactoryGirl.create(:data_source, :fields_str => [{:name => "field name", :display_name => "display name", :datatype => "varchar",:options => {:string_length=>200}.to_json}].to_json)  
      @charts_data_source = FactoryGirl.create(:charts_data_source, :chart => @chart, :data_source => @data_source)
      expect(@charts_data_source.generate_row_map).to eq([@dimension,@dimension2])      
    end 

    it "should generate a column map" do
      @chart = FactoryGirl.create(:chart)
      @measure = FactoryGirl.create(:measure, :format_as => 'opspc', :chart => @chart)
      @dimension = FactoryGirl.create(:dimension, :chart => @chart, :is_row => false)  
      @dimension2 = FactoryGirl.create(:dimension, :chart => @chart, :is_row => false)  
      @data_source = FactoryGirl.create(:data_source, :fields_str => [{:name => "field name", :display_name => "display name", :datatype => "varchar",:options => {:string_length=>200}.to_json}].to_json)  
      @charts_data_source = FactoryGirl.create(:charts_data_source, :chart => @chart, :data_source => @data_source)
      expect(@charts_data_source.generate_column_map).to eq([@dimension,@dimension2])      
    end      

    it "should generate a column map should return nil if enableForecast nil" do
      data_source = FactoryGirl.create(:data_source, :fields_str => [{:name => "field name", :display_name => "display name", :datatype => "varchar",:options => {:string_length=>200}.to_json}].to_json)  
      chart = FactoryGirl.create(:chart, :configs => ({:forecastObject => {:enableForecast => false}}).to_json)
      charts_data_source = FactoryGirl.create(:charts_data_source, :chart => chart, :data_source => data_source)
      expect(charts_data_source.generate_forecast_object).to eq(nil)
    end     

    it "should generate a forecast object" do
      chart = FactoryGirl.create(:chart, :configs => ({:forecastObject => {:enableForecast => true}}).to_json)
      charts_data_source = FactoryGirl.create(:charts_data_source, :chart => chart)
      expect(charts_data_source.generate_forecast_object).to eq({"enableForecast"=>true})
    end 

    it "should generate an aggregate object" do
      expected_object = {"test"=>"T Test", "control_field"=>"Body Weight", "comparison_function"=>"P Value", "enable_sem"=>false, "aggregateMap"=>[{"fieldName"=>"FieldName", "formatAs"=>"avg", "dataType"=>"string", "displayName"=>"Mean of FieldName"}, {"fieldName"=>"FieldName", "formatAs"=>"count", "dataType"=>"string", "test"=>"T Test", "control_field"=>"Body Weight", "displayName"=>"Count of FieldName"}, {"fieldName"=>"FieldName", "formatAs"=>"stddev", "dataType"=>"string", "test"=>"T Test", "control_field"=>"Body Weight", "displayName"=>"Stddev of FieldName"}]}
      chart = FactoryGirl.create(:chart, :configs => ({:forecastObject => {:enableForecast => true}}).to_json)
      measure = FactoryGirl.create(:measure, :format_as => 'opspc', :chart => chart)
      highlight_rule = FactoryGirl.create(:highlight_rule, :comparison_function => "P Value", :operator => "less than", :comparison_value => 0.05, :configs => {:test => 'T Test', :control_field => 'Body Weight'}.to_json, :enable_highlight => true , :chart => chart)
      charts_data_source = FactoryGirl.create(:charts_data_source, :chart => chart)
      expect(charts_data_source.generate_aggregate_map).to eq(expected_object)
    end 

    it "should return empty array if no highlight rule" do
      chart = FactoryGirl.create(:chart, :configs => ({:forecastObject => {:enableForecast => true}}).to_json)
      charts_data_source = FactoryGirl.create(:charts_data_source, :chart => chart)
      expect(charts_data_source.generate_aggregate_map).to eq([])
    end     

  end   

  describe "fact map" do 
    before(:each) do
      @account = FactoryGirl.create(:account)
      @user = FactoryGirl.create(:user, :account => @account)
      User.stub(:current_user).and_return(@user) 
    end 

    it "should generate a fact map for measure format opspc" do
      expected_object = [{"fieldName"=>"FieldName", "formatAs"=>"count", "displayName"=>"displayFieldName", "rAggregateKey"=>nil}]  
      chart = FactoryGirl.create(:chart)
      measure = FactoryGirl.create(:measure, :format_as => 'opspc', :chart => chart)      
      charts_data_source = FactoryGirl.create(:charts_data_source, :chart => chart)
      charts_data_source.init
      expect(charts_data_source.generate_fact_map).to eq(expected_object)
    end  

    it "should generate a fact map for measure format noopspc" do
      expected_object = [{"fieldName"=>"FieldName", "formatAs"=>"count", "displayName"=>"displayFieldName", "rAggregateKey"=>nil}]  
      chart = FactoryGirl.create(:chart)
      measure = FactoryGirl.create(:measure, :format_as => 'noopspc', :chart => chart)      
      charts_data_source = FactoryGirl.create(:charts_data_source, :chart => chart)
      charts_data_source.init
      expect(charts_data_source.generate_fact_map).to eq(expected_object)
    end     

    it "should generate a fact map for measure format noops" do
      expected_object = [{"fieldName"=>"FieldName", "formatAs"=>"count", "displayName"=>"displayFieldName", "rAggregateKey"=>nil}]  
      chart = FactoryGirl.create(:chart)
      measure = FactoryGirl.create(:measure, :format_as => 'noops', :chart => chart)      
      charts_data_source = FactoryGirl.create(:charts_data_source, :chart => chart)
      charts_data_source.init
      expect(charts_data_source.generate_fact_map).to eq(expected_object)
    end   

    it "should generate a fact map for measure format per_change_sum" do
      expected_object = [{"fieldName"=>"FieldName", "formatAs"=>"sum", "displayName"=>"displayFieldName", "rAggregateKey"=>"per_change_sum"}]
      chart = FactoryGirl.create(:chart)
      measure = FactoryGirl.create(:measure, :format_as => 'per_change_sum', :chart => chart)      
      charts_data_source = FactoryGirl.create(:charts_data_source, :chart => chart)
      charts_data_source.init
      expect(charts_data_source.generate_fact_map).to eq(expected_object)
    end   

    it "should generate a fact map for measure format per_change_count" do
      expected_object = [{"fieldName"=>"FieldName", "formatAs"=>"count", "displayName"=>"displayFieldName", "rAggregateKey"=>"per_change_count"}]
      chart = FactoryGirl.create(:chart)
      measure = FactoryGirl.create(:measure, :format_as => 'per_change_count', :chart => chart)      
      charts_data_source = FactoryGirl.create(:charts_data_source, :chart => chart)
      charts_data_source.init
      expect(charts_data_source.generate_fact_map).to eq(expected_object)
    end 

    it "should generate a fact map for measure format per_change_count" do
      expected_object = [{"fieldName"=>"FieldName", "formatAs"=>"count", "displayName"=>"displayFieldName", "rAggregateKey"=>"per_change_count"}]
      chart = FactoryGirl.create(:chart)
      measure = FactoryGirl.create(:measure, :format_as => 'per_change_count', :chart => chart)      
      charts_data_source = FactoryGirl.create(:charts_data_source, :chart => chart)
      charts_data_source.init
      expect(charts_data_source.generate_fact_map).to eq(expected_object)
    end  

    it "should generate a fact map for any other specified measure format" do
      expected_object = [{"fieldName"=>"FieldName", "formatAs"=>"sum", "displayName"=>"displayFieldName", "rAggregateKey"=>nil}]
      chart = FactoryGirl.create(:chart)
      measure = FactoryGirl.create(:measure, :format_as => 'sum', :chart => chart)      
      charts_data_source = FactoryGirl.create(:charts_data_source, :chart => chart)
      charts_data_source.init
      expect(charts_data_source.generate_fact_map).to eq(expected_object)
    end  

    it "should generate a fact map with lat/lng for chart type 4" do
      expected_object = [{"fieldName"=>"FieldName", "formatAs"=>"sum", "displayName"=>"displayFieldName", "rAggregateKey"=>nil}, {"fieldName"=>"lat", "formatAs"=>""}, {"fieldName"=>"lon", "formatAs"=>""}]
      chart = FactoryGirl.create(:chart, :chart_type => 4 )
      measure = FactoryGirl.create(:measure, :format_as => 'sum', :chart => chart)   
      data_source = FactoryGirl.create(:data_source, :fields_str => [{:name => "lat", :display_name => "lat", :datatype => "varchar",:options => {:string_length=>200}.to_json}, {:name => "lon", :display_name => "lon", :datatype => "varchar",:options => {:string_length=>200}.to_json}].to_json)         
      charts_data_source = FactoryGirl.create(:charts_data_source, :chart => chart, :data_source => data_source)
      charts_data_source.init
      expect(charts_data_source.generate_fact_map).to eq(expected_object)
    end   

    it "should generate a fact map with lat/lng for chart type 16" do
      expected_object = [{"fieldName"=>"FieldName", "formatAs"=>"sum", "displayName"=>"displayFieldName", "rAggregateKey"=>nil}, {"fieldName"=>"latitude", "formatAs"=>""}, {"fieldName"=>"longitude", "formatAs"=>""}]
      chart = FactoryGirl.create(:chart, :chart_type => 16 )
      measure = FactoryGirl.create(:measure, :format_as => 'sum', :chart => chart)  
      data_source = FactoryGirl.create(:data_source, :fields_str => [{:name => "latitude", :display_name => "latitude", :datatype => "varchar",:options => {:string_length=>200}.to_json}, {:name => "longitude", :display_name => "longitude", :datatype => "varchar",:options => {:string_length=>200}.to_json}].to_json)
      charts_data_source = FactoryGirl.create(:charts_data_source, :chart => chart, :data_source => data_source)
      charts_data_source.init
      expect(charts_data_source.generate_fact_map).to eq(expected_object)
    end                 
  end

  describe "generate_conditions_map" do
    before(:each) do
      @account = FactoryGirl.create(:account)
      @user = FactoryGirl.create(:user, :account => @account)
      User.stub(:current_user).and_return(@user) 
    end 

    it "should generate a conditions map " do
      expected_object = [{"fieldName"=>"field name", "formatAs"=>"sum", "dataType"=>"string", "comparision"=>"IN", "value"=>[]}, {"fieldName"=>"field name", "formatAs"=>"sum", "dataType"=>"string", "comparision"=>"IN", "value"=>[]}]
      chart = FactoryGirl.create(:chart)
      chart_filter = FactoryGirl.create(:chart_filter, :chart => chart)
      vertical = FactoryGirl.create(:vertical, :account => @account)
      dashboard = FactoryGirl.create(:dashboard, :vertical => vertical)
      dashboard_filter = FactoryGirl.create(:dashboard_filter, :dashboard => dashboard)   
      measure = FactoryGirl.create(:measure, :format_as => 'opspc', :chart => chart)      
      charts_data_source = FactoryGirl.create(:charts_data_source, :chart => chart)
      charts_data_source.init
      expect(charts_data_source.generate_conditions_map).to eq(expected_object)
    end  
  end

end