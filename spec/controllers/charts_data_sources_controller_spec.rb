require 'spec_helper'
describe ChartsDataSourcesController do
	before(:each) do
 		 @cds = FactoryGirl.create(:charts_data_source)
	end

	describe "GET 'index'" do
		it 'should be successful' do
			get :index, :format => :json
			response.should be_successful
		end

		it 'should get by id' do
			get :index, :format => :json, ids: @cds
			assigns(:cds).should eq([@cds])
		end
	end

	describe "GET 'show'" do
		it 'should be successful' do
			get :show, :format => :json, id: @cds
			response.should be_successful
		end

		it 'should find correct cds' do
			get :show, :format => :json, id: @cds
			assigns(:cds).should eq(@cds)
		end
	end

	describe "PUT 'update'" do
		it 'should locate requested cds' do
			put :update, :format => :json, :id => @cds, :cds => FactoryGirl.attributes_for(:charts_data_source)
			assigns(:cds).should eq(@cds)
		end

		it "should change @cds's attributes with valid values" do
			put :update, :format => :json, :id => @cds,
				:charts_data_source => FactoryGirl.attributes_for(:charts_data_source, fact: "new fact")
			@cds.reload
			@cds.fact.should eq('new fact')
		end

		it "should not change @cds's attributes with invalid values" do
			put :update, :format => :json, :id => @cds,
				:charts_data_source => FactoryGirl.attributes_for(:charts_data_source, data_source_id: "")
			@cds.reload
			@cds.fact.should_not eq('')			
		end
	end

	describe ".destroy" do
		it 'should delete cds' do
			expect do
				delete :destroy, :format => :json ,:id => @cds
			end.to change(ChartsDataSource, :count).by(-1)
		end
	end
end