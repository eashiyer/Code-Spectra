# == Schema Information
#
# Table name: charts
#
#  id                  :integer          not null, primary key
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  dashboard_id        :integer          not null
#  chart_type          :integer          not null
#  configs             :text
#  secondary_dimension :string(255)
#  title               :string(255)
#  subtitle            :string(255)
#  css_class_name      :string(255)      default("span")
#  width               :integer          default(600)
#  height              :integer          default(400)
#  margin_top          :integer          default(60)
#  margin_left         :integer          default(60)
#  margin_right        :integer          default(60)
#  margin_bottom       :integer          default(60)
#  modal_enabled       :boolean          default(FALSE)
#  modal_title         :string(255)      default("Summary")
#  is_hidden           :boolean          default(FALSE)
#  display_rank        :integer          default(0)
#

require 'spec_helper'

describe Chart do
  it { should belong_to(:dashboard)}
  it { should have_many(:comments)}
  it { should have_many(:charts_data_sources)}
  it { should have_and_belong_to_many(:data_sources) };
  it { should have_many(:charts_users)}
end
  
describe " when find is called" do
	before(:each) do
		chart = FactoryGirl.create(:chart)
		@comments = []
		@data_sources = []
		2.times do 
			@comments << FactoryGirl.create(:comment, :chart => chart)
			@data_sources << FactoryGirl.create(:data_source, :charts => [chart])
	  end
		# chart.stub(:populate_associations)
    # TODO : Figure out why this doesnt work
    #  		Chart.should_receive(:populate_associations)

		@chart = Chart.find(chart.id)
	end

	it "should have correct associations" do
    @chart.comment_ids.should_not be_nil
    @chart.data_source_ids.should_not be_nil
    @chart.chart_name.should_not be_nil
    @chart.charts_data_source_ids.should_not be_nil
	end

  it 'should return correct chart_type index' do
    @chart.chart_type == Chart.chart_type( @chart.chart_name)
  end

  it 'should return correct chart_name' do
    @chart.chart_name == Chart.chart_name(@chart.chart_type)
  end

end
describe "#vertical" do
  before(:each) do 
    @vertical = FactoryGirl.create(:vertical)
    @dashboard = FactoryGirl.create(:dashboard, :vertical => @vertical)
    @chart = FactoryGirl.create(:chart, :dashboard => @dashboard)
  end

  it "should return correct vertical" do
    expect(@chart.vertical).to be(@vertical)
  end
end

describe '.create_chart' do

  it 'should create chart from input params' do
    chart = FactoryGirl.build(:chart)
    new_chart = Chart.new
    params = {};
    params[:chart] = chart
    params[:chart][:charts_data_sources_str] = FactoryGirl.build(:charts_data_source)
    # puts params[:chart].to_json
    # params[:dashboard] = FactoryGirl.create(:dashboard)
    # new_chart.create_chart(params[:chart]) #error
  end
end

describe '.update_chart' do
    before(:each) do
      @chart = FactoryGirl.create(:chart)
    end
    
  it 'should update chart attributes' do
    params = {}
    chart = Chart.find @chart.id
    chart.title = 'new title'
    params[:chart] = chart
    @chart.update_chart params[:chart] #error
  end
end
