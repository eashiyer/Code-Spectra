require 'spec_helper'
describe ChartsController do
	before(:each) do
		@chart = FactoryGirl.create(:chart)
		id = FactoryGirl.create(:dashboard).id
		@attr =  {
					:chart_type => 'bar',
					:dashboard_id => id,
					:charts_data_sources_str => FactoryGirl.attributes_for(:charts_data_source).to_json
				}
	end

	describe "Creating new chart with valid parameters" do
		it "should create a new chart" do 
			expect {
				post :create, :chart => @attr
			}.to change(Chart, :count).by(1)
		end
	end

	describe "Updating existing chart with valid params" do
		it "should update existing chart" do 
			expect {
				put :update, :id => @chart ,chart: { :title => "qwerer"}
			}.to change(Chart, :count).by(0)
		end
	end

	describe '.index' do
		it 'should be successful' do
			get :index , :format => :json
			response.should be_successful
		end

		it 'by id should be successful' do
			get :index, :format => :json, :ids => [@chart.id]
			response.should be_successful
		end
	end

	describe '.show' do
		it 'should be successful' do
			get :show, :format => :json, :id => @chart.id
			response.should be_successful
		end
	end

	describe '.create' do
		it 'should be successful' do
			post :create, :chart => @attr
			response.should be_successful
		end
	end

	describe '.destroy' do
		it 'should be successful' do
			expect do
				get :destroy, :format => :json, :id => @chart
			end.to change(Chart, :count).by(-1)
		end
	end

end
