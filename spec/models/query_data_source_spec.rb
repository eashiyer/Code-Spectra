# == Schema Information
#
# Table name: query_data_sources
#
#  id                 :integer          not null, primary key
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  query              :text
#  frequency          :integer
#  data_connection_id :integer
#  data_source_id     :integer
#  last_run_at        :datetime
#  enabled            :boolean          default(TRUE)
#
require 'spec_helper'

describe QueryDataSource do
  it { should belong_to(:data_source) }
  it { should belong_to(:data_connection) }

  before(:each) do
    @account = FactoryGirl.create(:account)

  	@dconn = {
  		:host => 'localhost',
  		:connection_type => 'mysql',
  		:dbname => 'cibi_development',
  		:username => 'root',
  		:password => 'sk4scrappers',
  		:port => 3306
  	}

    fields = [{:name => "id", :display_name => "id", :datatype => "integer",:options => {}.to_json},
        {:name => "dashboard_id", :display_name => "dashboard_id", :datatype => "varchar",:options => {:string_length=>200}.to_json},
        {:name => "chart_type", :display_name => "chart_type", :datatype => "integer",:options => {}.to_json},
        {:name => "title", :display_name => "title", :datatype => "varchar",:options => {:string_length=>200}.to_json},
        {:name => "subtitle", :display_name => "subtitle", :datatype => "varchar",:options => {:string_length=>200}.to_json},
        {:name => "css_class_name", :display_name => "css_class_name", :datatype => "varchar",:options => {:string_length=>200}.to_json},
        {:name => "width", :display_name => "width", :datatype => "integer",:options => {}.to_json},
        {:name => "height", :display_name => "height", :datatype => "integer",:options => {}.to_json},
        {:name => "rows", :display_name => "rows", :datatype => "integer",:options => {}.to_json},
        {:name => "columns", :display_name => "columns", :datatype => "integer",:options => {}.to_json}].to_json
    @data_source=FactoryGirl.create(:data_source, :account => @account, :fields_str => fields)
    @data_connection=FactoryGirl.create(:data_connection, @dconn.merge(:account => @account))
  end

  describe "#execute" do

    it "should return a proper csv response of client database results" do
      @data_source.stub(:createContent).and_return(true)
      @data_connection.stub(:execute).and_return([{'id' => 2,'dashboard_id' => 2,'chart_type' => 1,'title' => 'TEST DOWNLOAD','subtitle' => 'Test','css_class_name' => 'span','width' => 600,'height' => 400,'rows' => 1,'columns' => 1},{'id' => 5,'dashboard_id' => 4,'chart_type' => 9,'title' => nil,'subtitle' => nil,'css_class_name' => 'span','width' => 600,'height' => 400,'rows' => 1,'columns' => 1}])
      qds=FactoryGirl.create(:query_data_source, :data_source => @data_source, :data_connection => @data_connection, :query => "SELECT * FROM charts")
      expect(qds.execute).to eql("id,dashboard_id,chart_type,title,subtitle,css_class_name,width,height,rows,columns\n2,2,1,TEST DOWNLOAD,Test,span,600,400,1,1\n5,4,9,,,span,600,400,1,1\n")
    end

    it "should return a proper csv response of client database results with bookmark conditions applied" do
      @data_source.stub(:createContent).and_return(true)
      @data_connection.stub(:execute).and_return([{'id' => 2,'dashboard_id' => 2,'chart_type' => 1,'title' => 'TEST DOWNLOAD','subtitle' => 'Test','css_class_name' => 'span','width' => 600,'height' => 400,'rows' => 1,'columns' => 1},{'id' => 5,'dashboard_id' => 4,'chart_type' => 9,'title' => nil,'subtitle' => nil,'css_class_name' => 'span','width' => 600,'height' => 400,'rows' => 1,'columns' => 1}])
      Cibids.stub_chain(:new, :get_bookmark_value).and_return(1)
      qds=FactoryGirl.create(:query_data_source, :data_source => @data_source, :data_connection => @data_connection, :query => "SELECT * FROM charts where $$CIBI_BOOKMARK_CONDITION", :bookmark_key => "id", :bookmark_comparison_operator => ">")
      expect(qds.execute).to eql("id,dashboard_id,chart_type,title,subtitle,css_class_name,width,height,rows,columns\n2,2,1,TEST DOWNLOAD,Test,span,600,400,1,1\n5,4,9,,,span,600,400,1,1\n")
    end

    it "should return blank array if exception is raised" do
      @data_source.stub(:createContent).and_return(false)
      qds=FactoryGirl.create(:query_data_source, :data_source => @data_source, :data_connection => @data_connection, :query => "SELECT * FROM charts")
      expect(qds.execute).to eql([])
    end
  end

  describe "#bookmark_value" do
    it "should return bookmark_value" do
      Cibids.stub_chain(:new, :get_bookmark_value).and_return(1)
      qds=FactoryGirl.create(:query_data_source, :data_source => @data_source, :data_connection => @data_connection, :query => "SELECT * FROM charts where $$CIBI_BOOKMARK_CONDITION", :bookmark_key => "id", :bookmark_comparison_operator => ">")
      expect(qds.bookmark_value).to eql(1)
    end
  end

end
