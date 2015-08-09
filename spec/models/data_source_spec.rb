# == Schema Information
#
# Table name: data_sources
#
#  id               :integer          not null, primary key
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  name             :string(255)
#  dimensions_str   :text
#  groups_str       :text
#  fields_str       :text
#  load_count       :integer
#  enabled          :boolean
#  data_source_type :string(255)      default("csv")
#

require 'spec_helper'

describe DataSource do
	it { should belong_to(:account) };
	it { should have_many(:data_contents) };
	it { should have_and_belong_to_many(:charts) };

	# describe "find a data source" do
	# 	before(:each) do
	# 		data_source = FactoryGirl.create(:data_source)
	# 		@data_content = FactoryGirl.create(:data_content, :data_source => data_source)
	# 		@data_source = DataSource.find(data_source.id)
	# 	end

	# 	it "should create a data_source" do
	# 		@data_source.should_not be_nil
	# 	end

	# 	it 'should populate_relations if query_data_source is present' do
	# 		@data_source[:query_data_source_id].should_not be_nil
	# 	end

	# 	it 'should populate contents' do
	# 		@data_source.populate_content
	# 		@data_source[:content].should_not be_nil
	# 		@data_source[:data_content_ids].should_not be_nil
	# 	end
	# end

	describe "file upload" do
		before(:each) do
			@account = FactoryGirl.create(:account)
			@account.stub_chain(:data_sources, :length).and_return(1)
			@ds = FactoryGirl.create(:data_source)			
		    @ds.stub!(:account).and_return(@account)
		end

		it 'should accept and load csv file' do
			# test_document = "#{Rails.root}/spec/assets/test-document.csv"
			# file = Rack::Test::UploadedFile.new(test_document, "text/csv")
			file = ActionDispatch::Http::UploadedFile.new({
				:filename => 'test-document.csv',
				:type => 'text/csv',
				:tempfile => File.new("#{Rails.root}/spec/assets/test-document.csv")
			})

			#ds = FactoryGirl.create(:data_source)
			@ds.addContents [file]
			#assert DataContent.last.filename == file.original_filename
		end

		it 'should accept and load .xls file' do

			file = ActionDispatch::Http::UploadedFile.new({
				:filename => 'test-document.xls',
				:type => 'text/excel',
				:tempfile => File.new("#{Rails.root}/spec/assets/test-document.xls")
			})

			#ds = FactoryGirl.create(:data_source)
			@ds.addContents [file]
			#assert DataContent.last.filename == file.original_filename
		end

		it 'should accept and load .xlsx file' do

			file = ActionDispatch::Http::UploadedFile.new({
				:filename => 'test-document.xlsx',
				:type => 'text/excel',
				:tempfile => File.new("#{Rails.root}/spec/assets/test-document.xlsx")
			})

			#ds = FactoryGirl.create(:data_source)
			@ds.addContents [file]
			#assert DataContent.last.filename == file.original_filename
		end

		it 'should not accept any other file type' do
			file = ActionDispatch::Http::UploadedFile.new({
				:filename => 'test-document.pdf',
				:type => 'application/pdf',
				:tempfile => File.new("#{Rails.root}/spec/assets/test-document.pdf")
			})

			#ds = FactoryGirl.create(:data_source)
			@ds.addContents [file]
			dc = DataContent.last
			assert dc.nil?
		end

		it 'should not accept any other file type' do
			file = ActionDispatch::Http::UploadedFile.new({
				:filename => 'test-document.png',
				:type => 'image/png',
				:tempfile => File.new("#{Rails.root}/spec/assets/test-document.png")
			})

			#ds = FactoryGirl.create(:data_source)
			@ds.addContents [file]
			dc = DataContent.last
			assert dc.nil?
		end


		it 'should accept csv with different date formats' do
			file = ActionDispatch::Http::UploadedFile.new({
				:filename => 'test-document.csv',
				:type => 'text/csv',
				:tempfile => File.new("#{Rails.root}/spec/assets/date_format_data.csv")
			})

			table_fields = [{:name => "d_m_yy",:display_name => "d_m_yy",:data_type => "date",:options => {:date_seperator => "-",:date_format => "d-m-yy"}, :default => nil},
							{:name => "dd_MON_yy",:display_name => "dd_MON_yy",:data_type => "date",:options => {:date_seperator => "-",:date_format => "dd-MON-yy"},:default => nil},
							{:name => "hh_mm",:display_name => "hh_mm",:data_type => "time",:options => {:time_seperator => ":",:time_format => "hh:mm"},:default => nil},
							{:name => "dd_mm_yy_hh_mm",:display_name => "dd_mm_yy_hh_mm",:data_type => "datetime",:options => {:date_seperator => "/",:date_format => "dd/mm/yy",:time_seperator => ":",:time_format => "hh:mm"},:default => nil},
							{:name => "mm_dd_yy",:display_name => "mm_dd_yy",:data_type => "date",:options => {:date_seperator => "/",:date_format => "mm/dd/yy"},:default => nil}]
			

			#table_fields = "[{\"name\":\"ORDER_BOOKED_DATE\",\"display_name\":\"ORDER_BOOKED_DATE\",\"data_type\":\"date\",\"options\":\"{\\\"date_seperator\\\":\\\"-\\\",\\\"date_format\\\":\\\"d-m-yy\\\"}\",\"default\":null},
			#				 {\"name\":\"LINE_CREATION_DATE\",\"display_name\":\"LINE_CREATION_DATE\",\"data_type\":\"date\",\"options\":\"{\\\"date_seperator\\\":\\\"-\\\",\\\"date_format\\\":\\\"dd-MON-yy\\\"}\",\"default\":null},
			#				 {\"name\":\"TIME\",\"display_name\":\"TIME\",\"data_type\":\"time\",\"options\":\"{\\\"time_seperator\\\":\\\":\\\",\\\"time_format\\\":\\\"hh:mm\\\"}\",\"default\":null},
			#				 {\"name\":\"DateTime\",\"display_name\":\"DateTime\",\"data_type\":\"datetime\",\"options\":\"{\\\"date_seperator\\\":\\\"/\\\",\\\"date_format\\\":\\\"dd/mm/yy\\\",\\\"time_seperator\\\":\\\":\\\",\\\"time_format\\\":\\\"hh:mm\\\"}\",\"default\":null},
			#				 {\"name\":\"PMDate\",\"display_name\":\"PMDate\",\"data_type\":\"date\",\"options\":\"{\\\"date_seperator\\\":\\\"/\\\",\\\"date_format\\\":\\\"mm/dd/yy\\\"}\",\"default\":null}]"

			table_fields = table_fields.to_json
			
			@ds.createContent(file.original_filename, 'csv', file.tempfile.read, 'date_format.csv', '25', table_fields, [])
			dc = DataContent.last
			assert DataContent.last.filename == file.original_filename
			cbds = Cibids.new	
			cbds.drop_table("1_contents")		
		end		

	end

end
