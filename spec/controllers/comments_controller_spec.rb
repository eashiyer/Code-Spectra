require 'spec_helper'
describe CommentsController do
	before(:each) do
		@comment = FactoryGirl.create(:comment)
	end

	describe "Creating new comment with invalid parameters" do
		before do
			@comment_params = {}
		end
		it "should not create a new comment" do 
			expect {
				post :create,:format => :json, comment: @comment_params	
			}.to change(Comment, :count).by(0)
		end
	end

	describe "Creating new comment with valid parameters" do
		before do
			@comment_params = {
				author_name: 'Shon',
				author_id: 1,
				message: 'This is a test message',
				chart_id: 1,
				status: nil
			}
		end
		it "should create a new comment" do 
			expect {
				post :create, :format => :json, comment: @comment_params	
			}.to change(Comment, :count).by(1)
		end
	end

	describe 'index action' do
		it 'should render all comments' do
			get :index, :format => :json
			response.should be_success
		end
	end

	describe "GET 'new'" do
		it 'should respond with new comment' do
			get :new, :format => :json
			response.should be_success
		end
	end

	describe "GET 'show'" do
		it 'should find right comment' do
			get :show, :format => :json, :id => @comment
			assigns(:comment).should == @comment
		end		
	end

	describe "PUT 'update'" do
		it 'should locate the requested @comment' do
			put :update, :format => :json, :id => @comment, :comment => FactoryGirl.attributes_for(:comment)
			assigns(:comment).should eq(@comment)
		end

		it "should change @comment's attributes with valid values"do
			put :update, :format => :json, :id => @comment,
				:comment => FactoryGirl.attributes_for(:comment, author_name: "new name")
			@comment.reload
			@comment.author_name.should eq('new name')
		end

		it "should not change @comment's attributes with invalid values" do
			put :update, :format => :json, :id => @comment,
				:comment => FactoryGirl.attributes_for(:comment, author_name: "")
			@comment.reload
			@comment.author_name.should_not eq("")
		end

	end
end
