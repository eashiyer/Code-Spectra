# == Schema Information
#
# Table name: data_contents
#
#  id             :integer          not null, primary key
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  filename       :string(255)
#  format         :string(255)
#  content        :text(16777215)
#  tag            :string(255)
#  data_source_id :integer
#  size           :float
#

require 'spec_helper'

describe DataContent do
	before(:each) do
		@account = FactoryGirl.create(:account)
  		@user = FactoryGirl.create(:user, :account => @account)
  		User.stub(:current_user).and_return(@user) 
		@data_source = FactoryGirl.create(:data_source)
		@data_content = FactoryGirl.create(:data_content,:filename => "sample file",
			:format => "csv", 
			:content => "some content", 
			:data_source => @data_source, 
			:size => "12")
	end

	it { should belong_to(:data_source) };

	describe "#destroy_and_update" do
		it 'should destroy and update when data content is present' do
			Cibids.stub_chain(:new, :drop_table).and_return(true)
			@data_content.destroy_and_update.should be_true					
		end

		it 'should delete data when more than one data content are present' do
			Cibids.stub_chain(:new, :delete_data).and_return(true)
			data_content = FactoryGirl.create(:data_content,:filename => "sample file",
				:format => "csv", 
				:content => "some content", 
				:data_source => @data_source, 
				:size => "12")
			@data_content.destroy_and_update.should be_true		
		end	

		it 'should raise active record rollback if delete data fails' do
			Cibids.stub_chain(:new, :delete_data).and_return(false)
			data_content = FactoryGirl.create(:data_content,:filename => "sample file",
				:format => "csv", 
				:content => "some content", 
				:data_source => @data_source, 
				:size => "12")
			expect(@data_content.destroy_and_update).to be_nil	
		end			
	end
end
