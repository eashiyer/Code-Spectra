require 'spec_helper'

describe SpreeDataSource do
 	it { should belong_to(:data_source) }
	it { should validate_presence_of(:store_name) }
 	it { should validate_presence_of(:store_url) }
 	it { should validate_presence_of(:api_token) } 	

 	before(:each) do
 		@account = FactoryGirl.create(:account)
 		@data_source = FactoryGirl.create(:data_source, :account => @account)
 		@spree_data_source = FactoryGirl.create(:spree_data_source, :data_source => @data_source,
 												:store_url => "https://mega-market-5303.spree.mx",
 												:api_token => "46ab2aa91ff1fdb2f84411c0d5bc7ad245f2264ce7d0580e",
 												:import_type => "sales",
 												:frequency_of_import => 30) 
 	end

 	describe "#create_table" do
 		it "should return true if table is created" do
 			Cibids.stub_chain(:new,:create_table).and_return(true)
 			expect(@spree_data_source.create_table).to eql(true)
 		end

 		it "should return false if table is not created" do
 			Cibids.stub_chain(:new,:create_table).and_return(false)
 			expect(@spree_data_source.create_table).to eql(false)
 		end 		
 	end 

	describe "#fetch_spree_sales" do 	
		before(:each) do
			@time_now = Time.parse("Jul 31 2014")
			@order_token_hash = {"R060627357"=>"23a1e3742cb3822e", "R754668150"=>"f49c6ab26f385a5c", "R987654321"=>"c391d690d4c4bfb5", "R620725285"=>"1da003f2191fdf2d", "R123456789"=>"7ae96801a33b51d2", "R252861602"=>"6d11253c353df276", "R144747205"=>"3d2a55001698bd95", "R535663711"=>"adb91f920a69c255", "R114571615"=>"fbc17261ffed88d2", "R443720735"=>"6e3e9fc9c4beb949", "R672324236"=>"3fca9fbe53607793", "R360700535"=>"d603387f510317a7", "R757702604"=>"23e231e8f7a48210", "R720747840"=>"217c7d0fac1b096a", "R746001851"=>"02fda4a5035d1e9b", "R850878861"=>"bd2205894a8943c4", "R050373827"=>"c01ae230a6b6fb51", "R753603635"=>"fff412c4232956d8", "R866471888"=>"f8de7df6d3f2417f", "R363827600"=>"cc6fe3eb7ea32005", "R785477882"=>"03be160abb9016fe", "R258400172"=>"d976f2deaf0c73ca", "R116875545"=>"b6630a645d41325b", "R614858424"=>"c51aa53f2bdad681", "R825067616"=>"934c3a7cf562680b"}	
		end

 		it "should fetch orders and return order_token hash" do
 			SpreeDataSourceSalesWorker.stub!(:perform_async).and_return(true)
 			Cibids.stub_chain(:new,:get_bookmark_value).and_return(nil)
 			Time.stub!(:now).and_return(@time_now)
 			VCR.use_cassette 'model/orders_response' do
 				expect(@spree_data_source.fetch_spree_sales).to eql(@order_token_hash)
 			end
 		end	

 		it "should create data content" do
 			count = DataContent.all.count
 			SpreeDataSourceSalesWorker.stub!(:perform_async).and_return(true)
 			Cibids.stub_chain(:new,:get_bookmark_value).and_return(nil)
 			Time.stub!(:now).and_return(@time_now)
 			VCR.use_cassette 'model/orders_response' do
 				@spree_data_source.fetch_spree_sales
 			end
 			expect(DataContent.all.count).to be > count
 		end	

 		it "should not create data content if order_token are nil" do
 			count = DataContent.all.count
 			SpreeDataSourceSalesWorker.stub!(:perform_async).and_return(true)
 			Cibids.stub_chain(:new,:get_bookmark_value).and_return(nil)
 			time_now = Time.parse("Jul 31 2020")
 			Time.stub!(:now).and_return(time_now)
 			VCR.use_cassette 'model/nil_orders_response' do
 				@spree_data_source.fetch_spree_sales
 			end
 			expect(DataContent.all.count).to eql(count)
 		end	 

 		it "should rescue any error" do
 			count = DataContent.all.count
 			SpreeDataSourceSalesWorker.stub!(:perform_async).and_return(true)
 			Cibids.stub_chain(:new,:get_bookmark_value).and_raise(Exception)
 			time_now = Time.parse("Jul 31 2020")
 			Time.stub!(:now).and_return(time_now)
 			VCR.use_cassette 'model/nil_orders_response' do
 				@spree_data_source.fetch_spree_sales
 			end
 			expect(DataContent.all.count).to eql(count)
 		end 				
	end

	describe "#fetch_and_save_spree_sales(order_number, order_token, data_content_id)" do 	
		before(:each) do
			@time_now = Time.parse("Jul 31 2014")
			@order_token_hash = {"R060627357"=>"23a1e3742cb3822e", "R754668150"=>"f49c6ab26f385a5c", "R987654321"=>"c391d690d4c4bfb5", "R620725285"=>"1da003f2191fdf2d", "R123456789"=>"7ae96801a33b51d2", "R252861602"=>"6d11253c353df276", "R144747205"=>"3d2a55001698bd95", "R535663711"=>"adb91f920a69c255", "R114571615"=>"fbc17261ffed88d2", "R443720735"=>"6e3e9fc9c4beb949", "R672324236"=>"3fca9fbe53607793", "R360700535"=>"d603387f510317a7", "R757702604"=>"23e231e8f7a48210", "R720747840"=>"217c7d0fac1b096a", "R746001851"=>"02fda4a5035d1e9b", "R850878861"=>"bd2205894a8943c4", "R050373827"=>"c01ae230a6b6fb51", "R753603635"=>"fff412c4232956d8", "R866471888"=>"f8de7df6d3f2417f", "R363827600"=>"cc6fe3eb7ea32005", "R785477882"=>"03be160abb9016fe", "R258400172"=>"d976f2deaf0c73ca", "R116875545"=>"b6630a645d41325b", "R614858424"=>"c51aa53f2bdad681", "R825067616"=>"934c3a7cf562680b"}	
		end

 		it "should fetch orders and return order_token hash" do
 			Cibids.stub_chain(:new,:add_data).and_return(true)
 			Time.stub!(:now).and_return(@time_now)
 			VCR.use_cassette 'model/single_order_response' do
 				expect(@spree_data_source.fetch_and_save_spree_sales('R060627357','23a1e3742cb3822e',3)).to eql(true)
 			end
 		end	

 		it "should not add data if api response is nil" do
 			@spree_data_source.stub!(:get_spree_sales).and_return(nil)
 			Cibids.stub_chain(:new,:add_data).and_raise(Exception)
 			VCR.use_cassette 'model/nil_single_order_response' do
 				expect(@spree_data_source.fetch_and_save_spree_sales('R0606273571','23a1e3742cb3822e',3)).to eql(true)
 			end
 		end	 	

 		it "should raise and rescue Exception" do
 			Cibids.stub_chain(:new,:add_data).and_raise(Exception)
 			Time.stub!(:now).and_return(@time_now)
 			VCR.use_cassette 'model/single_order_response' do
 				expect(@spree_data_source.fetch_and_save_spree_sales('R060627357','23a1e3742cb3822e',3)).to raise_error
 			end
 		end	  			 				
	end	

	describe "#get_order_tokens" do 		
 		it "should return order tokens hash" do
 			order_token_hash = {"R060627357"=>"23a1e3742cb3822e", "R754668150"=>"f49c6ab26f385a5c", "R987654321"=>"c391d690d4c4bfb5", "R620725285"=>"1da003f2191fdf2d", "R123456789"=>"7ae96801a33b51d2", "R252861602"=>"6d11253c353df276", "R144747205"=>"3d2a55001698bd95", "R535663711"=>"adb91f920a69c255", "R114571615"=>"fbc17261ffed88d2", "R443720735"=>"6e3e9fc9c4beb949", "R672324236"=>"3fca9fbe53607793", "R360700535"=>"d603387f510317a7", "R757702604"=>"23e231e8f7a48210", "R720747840"=>"217c7d0fac1b096a", "R746001851"=>"02fda4a5035d1e9b", "R850878861"=>"bd2205894a8943c4", "R050373827"=>"c01ae230a6b6fb51", "R753603635"=>"fff412c4232956d8", "R866471888"=>"f8de7df6d3f2417f", "R363827600"=>"cc6fe3eb7ea32005", "R785477882"=>"03be160abb9016fe", "R258400172"=>"d976f2deaf0c73ca", "R116875545"=>"b6630a645d41325b", "R614858424"=>"c51aa53f2bdad681", "R825067616"=>"934c3a7cf562680b"}	
 			VCR.use_cassette 'model/orders_response' do
 				url = "https://mega-market-5303.spree.mx/api/orders.json?q%5Bupdated_at_gteq%5D=2014-07-30T23:30:00.000Z&token=46ab2aa91ff1fdb2f84411c0d5bc7ad245f2264ce7d0580e"
 				@orders = Curl.get(url)
 			end
 			expect(@spree_data_source.get_order_tokens(@orders.body_str)).to eql(order_token_hash)
 		end	
	end

	describe "#get_spree_sales" do 		
 		it "should return sales hash json" do
 			sales_json = "{\"sales\":[{\"id\":1,\"quantity\":2,\"price\":\"15.99\",\"variant_id\":1,\"single_display_amount\":\"$15.99\",\"display_amount\":\"$31.98\",\"total\":\"31.98\",\"adjustments\":[],\"variant_name\":\"Ruby on Rails Tote\",\"variant_sku\":\"ROR-00011\",\"variant_price\":\"15.99\",\"variant_weight\":\"0.0\",\"variant_height\":null,\"variant_width\":null,\"variant_depth\":null,\"variant_master\":true,\"cost_price\":\"17.0\",\"slug\":\"ruby-on-rails-tote\",\"description\":\"Esse vel praesentium hic. Repudiandae aut laborum ut deleniti. Culpa delectus temporibus quisquam. Eum dolorem hic velit voluptate earum provident et. Voluptatem corrupti est nisi ut dolore.\",\"track_inventory\":true,\"display_price\":\"$15.99\",\"options_text\":\"\",\"in_stock\":true,\"option_values\":[],\"images\":[{\"id\":21,\"position\":1,\"attachment_content_type\":\"image/jpeg\",\"attachment_file_name\":\"ror_tote.jpeg\",\"type\":\"Spree::Image\",\"attachment_updated_at\":\"2014-08-15T14:48:16.630Z\",\"attachment_width\":360,\"attachment_height\":360,\"alt\":null,\"viewable_type\":\"Spree::Variant\",\"viewable_id\":1,\"mini_url\":\"http://s3.amazonaws.com/spree-sandbox/sandbox/products/21/mini/ror_tote.jpeg?1408114096\",\"small_url\":\"http://s3.amazonaws.com/spree-sandbox/sandbox/products/21/small/ror_tote.jpeg?1408114096\",\"product_url\":\"http://s3.amazonaws.com/spree-sandbox/sandbox/products/21/product/ror_tote.jpeg?1408114096\",\"large_url\":\"http://s3.amazonaws.com/spree-sandbox/sandbox/products/21/large/ror_tote.jpeg?1408114096\"},{\"id\":22,\"position\":2,\"attachment_content_type\":\"image/jpeg\",\"attachment_file_name\":\"ror_tote_back.jpeg\",\"type\":\"Spree::Image\",\"attachment_updated_at\":\"2014-08-15T14:48:16.840Z\",\"attachment_width\":360,\"attachment_height\":360,\"alt\":null,\"viewable_type\":\"Spree::Variant\",\"viewable_id\":1,\"mini_url\":\"http://s3.amazonaws.com/spree-sandbox/sandbox/products/22/mini/ror_tote_back.jpeg?1408114096\",\"small_url\":\"http://s3.amazonaws.com/spree-sandbox/sandbox/products/22/small/ror_tote_back.jpeg?1408114096\",\"product_url\":\"http://s3.amazonaws.com/spree-sandbox/sandbox/products/22/product/ror_tote_back.jpeg?1408114096\",\"large_url\":\"http://s3.amazonaws.com/spree-sandbox/sandbox/products/22/large/ror_tote_back.jpeg?1408114096\"}],\"product_id\":1,\"image_url\":\"http://s3.amazonaws.com/spree-sandbox/sandbox/products/21/small/ror_tote.jpeg?1408114096\",\"variant_total\":\"31.98\",\"variant_quantity\":2,\"order_number\":\"R060627357\",\"order_created_at\":\"2014-08-19T10:39:37.851Z\",\"order_updated_at\":\"2014-08-19T10:39:40.483Z\",\"order_completed_at\":null,\"state\":\"address\",\"order_shipment_state\":null,\"order_payment_state\":null,\"channel\":\"spree\",\"currency\":\"USD\"}]}"
 			VCR.use_cassette 'model/single_order_response' do
 				url = "https://mega-market-5303.spree.mx/api/orders/R060627357?order_token=23a1e3742cb3822e&token=46ab2aa91ff1fdb2f84411c0d5bc7ad245f2264ce7d0580e"
 				@orders = Curl.get(url)
 			end
 			expect(@spree_data_source.get_spree_sales(@orders.body_str)).to eql(sales_json)
 		end	

 		it "should return sales hash json with shipment details" do
 			sales_json = "{\"sales\":[{\"id\":2,\"quantity\":1,\"price\":\"22.99\",\"variant_id\":2,\"single_display_amount\":\"$22.99\",\"display_amount\":\"$22.99\",\"total\":\"24.14\",\"adjustments\":[{\"id\":2,\"source_type\":\"Spree::TaxRate\",\"source_id\":1,\"adjustable_type\":\"Spree::LineItem\",\"adjustable_id\":2,\"amount\":\"1.15\",\"label\":\"North America 5.0%\",\"mandatory\":null,\"eligible\":true,\"created_at\":\"2014-08-15T14:48:22.793Z\",\"updated_at\":\"2014-08-15T14:48:22.803Z\",\"display_amount\":\"$1.15\"}],\"variant_name\":\"Ruby on Rails Bag\",\"variant_sku\":\"ROR-00012\",\"variant_price\":\"22.99\",\"variant_weight\":\"0.0\",\"variant_height\":null,\"variant_width\":null,\"variant_depth\":null,\"variant_master\":true,\"cost_price\":\"21.0\",\"slug\":\"ruby-on-rails-bag\",\"description\":\"Esse vel praesentium hic. Repudiandae aut laborum ut deleniti. Culpa delectus temporibus quisquam. Eum dolorem hic velit voluptate earum provident et. Voluptatem corrupti est nisi ut dolore.\",\"track_inventory\":true,\"display_price\":\"$22.99\",\"options_text\":\"\",\"in_stock\":true,\"option_values\":[],\"images\":[{\"id\":23,\"position\":1,\"attachment_content_type\":\"image/jpeg\",\"attachment_file_name\":\"ror_bag.jpeg\",\"type\":\"Spree::Image\",\"attachment_updated_at\":\"2014-08-15T14:48:17.044Z\",\"attachment_width\":360,\"attachment_height\":360,\"alt\":null,\"viewable_type\":\"Spree::Variant\",\"viewable_id\":2,\"mini_url\":\"http://s3.amazonaws.com/spree-sandbox/sandbox/products/23/mini/ror_bag.jpeg?1408114097\",\"small_url\":\"http://s3.amazonaws.com/spree-sandbox/sandbox/products/23/small/ror_bag.jpeg?1408114097\",\"product_url\":\"http://s3.amazonaws.com/spree-sandbox/sandbox/products/23/product/ror_bag.jpeg?1408114097\",\"large_url\":\"http://s3.amazonaws.com/spree-sandbox/sandbox/products/23/large/ror_bag.jpeg?1408114097\"}],\"product_id\":2,\"image_url\":\"http://s3.amazonaws.com/spree-sandbox/sandbox/products/23/small/ror_bag.jpeg?1408114097\",\"variant_total\":\"24.14\",\"variant_quantity\":1,\"order_number\":\"R987654321\",\"order_created_at\":\"2014-08-15T14:48:22.547Z\",\"order_updated_at\":\"2014-08-28T06:53:59.886Z\",\"order_completed_at\":null,\"state\":\"complete\",\"order_shipment_state\":\"pending\",\"order_payment_state\":null,\"channel\":\"spree\",\"currency\":\"USD\",\"billed_to_firstname\":\"Aglae\",\"billed_to_lastname\":\"Bartoletti\",\"billed_to_address1\":\"650 Paige Plains\",\"billed_to_city\":\"Klockoville\",\"billed_to_zipcode\":\"16804\",\"billed_to_phone\":\"(883)431-7809 x964\",\"billed_to_company\":null,\"billed_to_state\":\"New York\",\"billed_to_country\":\"United States\",\"shipped_to_firstname\":\"Jamison\",\"shipped_to_lastname\":\"Dach\",\"shipped_to_address1\":\"15085 Johnathon Road\",\"shipped_to_city\":\"Elnaside\",\"shipped_to_zipcode\":\"16804\",\"shipped_to_phone\":\"(126)137-3339 x9612\",\"shipped_to_company\":null,\"shipped_to_state\":\"New York\",\"shipped_to_country\":\"United States\",\"shipment_id\":2,\"shipment_number\":\"H17143504376\",\"shipment_cost\":\"5.0\",\"shipment_shipped_at\":null,\"shipment_state\":\"pending\",\"stock_location_name\":\"default\"}]}"
 			VCR.use_cassette 'model/single_order_response_with_shipment_details' do
 				url = "https://mega-market-5303.spree.mx/api/orders/R987654321?order_token=c391d690d4c4bfb5&token=46ab2aa91ff1fdb2f84411c0d5bc7ad245f2264ce7d0580e"
 				@orders = Curl.get(url)
 			end
 			expect(@spree_data_source.get_spree_sales(@orders.body_str)).to eql(sales_json)
 		end	 	

 		it "should return nil if response string is nil" do 			
 			VCR.use_cassette 'model/nil_single_order_response' do
 				url = "https://mega-market-5303.spree.mx/api/orders/R0606273571?order_token=23a1e3742cb3822e&token=46ab2aa91ff1fdb2f84411c0d5bc7ad245f2264ce7d0580e"
 				@orders = Curl.get(url)
 			end
 			expect(@spree_data_source.get_spree_sales(@orders.body_str)).to eql(nil)
 		end	 			
	end	

	describe "#get_key_name" do 			
		it "return key name for predefined maps" do
			expect(@spree_data_source.get_key_name('name')).to eql('variant_name')
			expect(@spree_data_source.get_key_name('price')).to eql('variant_price')
			expect(@spree_data_source.get_key_name('sku')).to eql('variant_sku')
			expect(@spree_data_source.get_key_name('weight')).to eql('variant_weight')
			expect(@spree_data_source.get_key_name('height')).to eql('variant_height')
			expect(@spree_data_source.get_key_name('width')).to eql('variant_width')
			expect(@spree_data_source.get_key_name('depth')).to eql('variant_depth')
			expect(@spree_data_source.get_key_name('is_master')).to eql('variant_master')
		end

		it "return original key name otherwise" do
			expect(@spree_data_source.get_key_name('name1')).to eql('name1')
			expect(@spree_data_source.get_key_name('price1')).to eql('price1')
		end
	end

	describe "#get_table_data" do
		it "should return formatted data from response string" do 
			table_data = [[{"type"=>"number", "key"=>"id", "value"=>2}, {"type"=>"string", "key"=>"order_number", "value"=>"R987654321"}, {"type"=>"string", "key"=>"state", "value"=>"complete"}, {"type"=>"string", "key"=>"channel", "value"=>"spree"}, {"type"=>"string", "key"=>"currency", "value"=>"USD"}, {"type"=>"number", "key"=>"quantity", "value"=>1}, {"type"=>"number", "key"=>"price", "value"=>"22.99"}, {"type"=>"number", "key"=>"variant_id", "value"=>2}, {"type"=>"number", "key"=>"total", "value"=>"24.14"}, {"type"=>"string", "key"=>"order_shipment_state", "value"=>"pending"}, {"type"=>"string", "key"=>"order_payment_state", "value"=>nil}, {"type"=>"string", "key"=>"variant_name", "value"=>"Ruby on Rails Bag"}, {"type"=>"string", "key"=>"variant_sku", "value"=>"ROR-00012"}, {"type"=>"number", "key"=>"variant_price", "value"=>"22.99"}, {"type"=>"number", "key"=>"variant_weight", "value"=>"0.0"}, {"type"=>"number", "key"=>"variant_height", "value"=>nil}, {"type"=>"number", "key"=>"variant_width", "value"=>nil}, {"type"=>"number", "key"=>"variant_depth", "value"=>nil}, {"type"=>"boolean", "key"=>"variant_master", "value"=>true}, {"type"=>"number", "key"=>"variant_total", "value"=>"24.14"}, {"type"=>"number", "key"=>"variant_quantity", "value"=>1}, {"type"=>"boolean", "key"=>"in_stock", "value"=>true}, {"type"=>"number", "key"=>"cost_price", "value"=>"21.0"}, {"type"=>"text", "key"=>"description", "value"=>"Esse vel praesentium hic. Repudiandae aut laborum ut deleniti. Culpa delectus temporibus quisquam. Eum dolorem hic velit voluptate earum provident et. Voluptatem corrupti est nisi ut dolore."}, {"type"=>"string", "key"=>"image_url", "value"=>"http://s3.amazonaws.com/spree-sandbox/sandbox/products/23/small/ror_bag.jpeg?1408114097"}, {"type"=>"number", "key"=>"shipment_id", "value"=>2}, {"type"=>"string", "key"=>"shipment_number", "value"=>"H17143504376"}, {"type"=>"number", "key"=>"shipment_cost", "value"=>"5.0"}, {"type"=>"string", "key"=>"shipment_shipped_at", "value"=>nil}, {"type"=>"string", "key"=>"shipment_state", "value"=>"pending"}, {"type"=>"string", "key"=>"stock_location_name", "value"=>"default"}, {"type"=>"string", "key"=>"billed_to_firstname", "value"=>"Aglae"}, {"type"=>"string", "key"=>"billed_to_lastname", "value"=>"Bartoletti"}, {"type"=>"string", "key"=>"billed_to_address1", "value"=>"650 Paige Plains"}, {"type"=>"string", "key"=>"billed_to_city", "value"=>"Klockoville"}, {"type"=>"string", "key"=>"billed_to_zipcode", "value"=>"16804"}, {"type"=>"string", "key"=>"billed_to_phone", "value"=>"(883)431-7809 x964"}, {"type"=>"string", "key"=>"billed_to_company", "value"=>nil}, {"type"=>"string", "key"=>"billed_to_state", "value"=>"New York"}, {"type"=>"string", "key"=>"billed_to_country", "value"=>"United States"}, {"type"=>"string", "key"=>"shipped_to_firstname", "value"=>"Jamison"}, {"type"=>"string", "key"=>"shipped_to_lastname", "value"=>"Dach"}, {"type"=>"string", "key"=>"shipped_to_address1", "value"=>"15085 Johnathon Road"}, {"type"=>"string", "key"=>"shipped_to_city", "value"=>"Elnaside"}, {"type"=>"string", "key"=>"shipped_to_zipcode", "value"=>"16804"}, {"type"=>"string", "key"=>"shipped_to_phone", "value"=>"(126)137-3339 x9612"}, {"type"=>"string", "key"=>"shipped_to_company", "value"=>nil}, {"type"=>"string", "key"=>"shipped_to_state", "value"=>"New York"}, {"type"=>"string", "key"=>"shipped_to_country", "value"=>"United States"}, {"type"=>"datetime", "key"=>"order_created_at", "value"=>"2014/08/15 14:48:22"}, {"type"=>"datetime", "key"=>"order_updated_at", "value"=>"2014/08/28 06:53:59"}, {"type"=>"datetime", "key"=>"order_completed_at", "value"=>nil}, {"type"=>"string", "key"=>"data_content_id", "value"=>3}]]
 			VCR.use_cassette 'model/single_order_response_with_shipment_details' do
 				url = "https://mega-market-5303.spree.mx/api/orders/R987654321?order_token=c391d690d4c4bfb5&token=46ab2aa91ff1fdb2f84411c0d5bc7ad245f2264ce7d0580e"
 				order = Curl.get(url)
 				@items = @spree_data_source.get_spree_sales(order.body_str)
 			end
 			expect(@spree_data_source.get_table_data(@items,3)).to eql(table_data)
		end

		it "should return nil if data_hash is nil" do 		
 			VCR.use_cassette 'model/nil_single_order_response_with_shipment_details' do
 				url = "https://mega-market-5303.spree.mx/api/orders/R0606273571?order_token=23a1e3742cb3822e&token=46ab2aa91ff1fdb2f84411c0d5bc7ad245f2264ce7d0580e"
 				order = Curl.get(url)
 				@items = @spree_data_source.get_spree_sales(order.body_str)
 			end
 			expect(@spree_data_source.get_table_data(@items,3)).to eql(nil)
		end		
	end

	describe "#get_fields"	do
		it "should return fields" do
			expected_fields = [{"fieldName"=>"id", "fieldType"=>"integer", "defaultValue"=>nil}, {"fieldName"=>"order_number", "fieldType"=>"varchar(200)", "defaultValue"=>nil}, {"fieldName"=>"state", "fieldType"=>"varchar(200)", "defaultValue"=>nil}, {"fieldName"=>"channel", "fieldType"=>"varchar(200)", "defaultValue"=>nil}, {"fieldName"=>"currency", "fieldType"=>"varchar(200)", "defaultValue"=>nil}, {"fieldName"=>"quantity", "fieldType"=>"integer", "defaultValue"=>nil}, {"fieldName"=>"price", "fieldType"=>"decimal(15,3)", "defaultValue"=>nil}, {"fieldName"=>"variant_id", "fieldType"=>"integer", "defaultValue"=>nil}, {"fieldName"=>"total", "fieldType"=>"decimal(15,3)", "defaultValue"=>nil}, {"fieldName"=>"order_shipment_state", "fieldType"=>"varchar(200)", "defaultValue"=>nil}, {"fieldName"=>"order_payment_state", "fieldType"=>"varchar(200)", "defaultValue"=>nil}, {"fieldName"=>"variant_name", "fieldType"=>"varchar(200)", "defaultValue"=>nil}, {"fieldName"=>"variant_sku", "fieldType"=>"varchar(200)", "defaultValue"=>nil}, {"fieldName"=>"variant_price", "fieldType"=>"decimal(15,3)", "defaultValue"=>nil}, {"fieldName"=>"variant_weight", "fieldType"=>"decimal(15,3)", "defaultValue"=>nil}, {"fieldName"=>"variant_height", "fieldType"=>"decimal(15,3)", "defaultValue"=>nil}, {"fieldName"=>"variant_width", "fieldType"=>"decimal(15,3)", "defaultValue"=>nil}, {"fieldName"=>"variant_depth", "fieldType"=>"decimal(15,3)", "defaultValue"=>nil}, {"fieldName"=>"variant_master", "fieldType"=>"boolean", "defaultValue"=>nil}, {"fieldName"=>"variant_total", "fieldType"=>"decimal(15,3)", "defaultValue"=>nil}, {"fieldName"=>"variant_quantity", "fieldType"=>"integer", "defaultValue"=>nil}, {"fieldName"=>"in_stock", "fieldType"=>"boolean", "defaultValue"=>nil}, {"fieldName"=>"cost_price", "fieldType"=>"decimal(15,3)", "defaultValue"=>nil}, {"fieldName"=>"description", "fieldType"=>"text", "defaultValue"=>nil}, {"fieldName"=>"image_url", "fieldType"=>"varchar(200)", "defaultValue"=>nil}, {"fieldName"=>"shipment_id", "fieldType"=>"integer", "defaultValue"=>nil}, {"fieldName"=>"shipment_number", "fieldType"=>"varchar(200)", "defaultValue"=>nil}, {"fieldName"=>"shipment_cost", "fieldType"=>"decimal(15,3)", "defaultValue"=>nil}, {"fieldName"=>"shipment_shipped_at", "fieldType"=>"varchar(200)", "defaultValue"=>nil}, {"fieldName"=>"shipment_state", "fieldType"=>"varchar(200)", "defaultValue"=>nil}, {"fieldName"=>"stock_location_name", "fieldType"=>"varchar(200)", "defaultValue"=>nil}, {"fieldName"=>"billed_to_firstname", "fieldType"=>"varchar(200)", "defaultValue"=>nil}, {"fieldName"=>"billed_to_lastname", "fieldType"=>"varchar(200)", "defaultValue"=>nil}, {"fieldName"=>"billed_to_address1", "fieldType"=>"varchar(200)", "defaultValue"=>nil}, {"fieldName"=>"billed_to_city", "fieldType"=>"varchar(200)", "defaultValue"=>nil}, {"fieldName"=>"billed_to_zipcode", "fieldType"=>"varchar(200)", "defaultValue"=>nil}, {"fieldName"=>"billed_to_phone", "fieldType"=>"varchar(200)", "defaultValue"=>nil}, {"fieldName"=>"billed_to_company", "fieldType"=>"varchar(200)", "defaultValue"=>nil}, {"fieldName"=>"billed_to_state", "fieldType"=>"varchar(200)", "defaultValue"=>nil}, {"fieldName"=>"billed_to_country", "fieldType"=>"varchar(200)", "defaultValue"=>nil}, {"fieldName"=>"shipped_to_firstname", "fieldType"=>"varchar(200)", "defaultValue"=>nil}, {"fieldName"=>"shipped_to_lastname", "fieldType"=>"varchar(200)", "defaultValue"=>nil}, {"fieldName"=>"shipped_to_address1", "fieldType"=>"varchar(200)", "defaultValue"=>nil}, {"fieldName"=>"shipped_to_city", "fieldType"=>"varchar(200)", "defaultValue"=>nil}, {"fieldName"=>"shipped_to_zipcode", "fieldType"=>"varchar(200)", "defaultValue"=>nil}, {"fieldName"=>"shipped_to_phone", "fieldType"=>"varchar(200)", "defaultValue"=>nil}, {"fieldName"=>"shipped_to_company", "fieldType"=>"varchar(200)", "defaultValue"=>nil}, {"fieldName"=>"shipped_to_state", "fieldType"=>"varchar(200)", "defaultValue"=>nil}, {"fieldName"=>"shipped_to_country", "fieldType"=>"varchar(200)", "defaultValue"=>nil}, {"fieldName"=>"order_created_at", "fieldType"=>"datetime", "defaultValue"=>nil}, {"fieldName"=>"order_updated_at", "fieldType"=>"datetime", "defaultValue"=>nil}, {"fieldName"=>"order_completed_at", "fieldType"=>"datetime", "defaultValue"=>nil}]
			fieldsStr = @spree_data_source.create_field_str
			expect(@spree_data_source.get_fields(fieldsStr)).to eql(expected_fields)
		end
	end

	describe "#create_field_str"	do
		it "should return fields str" do
			expected_fields = [{"name"=>"id", "display_name"=>"id", "data_type"=>"integer", "options"=>"\"\"", "default"=>nil}, {"name"=>"order_number", "display_name"=>"order_number", "data_type"=>"varchar", "options"=>"{\"string_length\":\"200\"}", "default"=>nil}, {"name"=>"state", "display_name"=>"state", "data_type"=>"varchar", "options"=>"{\"string_length\":\"200\"}", "default"=>nil}, {"name"=>"channel", "display_name"=>"channel", "data_type"=>"varchar", "options"=>"{\"string_length\":\"200\"}", "default"=>nil}, {"name"=>"currency", "display_name"=>"currency", "data_type"=>"varchar", "options"=>"{\"string_length\":\"200\"}", "default"=>nil}, {"name"=>"quantity", "display_name"=>"quantity", "data_type"=>"integer", "options"=>"\"\"", "default"=>nil}, {"name"=>"price", "display_name"=>"price", "data_type"=>"decimal", "options"=>"{\"max_digits\":\"15\",\"max_decimals\":\"3\"}", "default"=>nil}, {"name"=>"variant_id", "display_name"=>"variant_id", "data_type"=>"integer", "options"=>"\"\"", "default"=>nil}, {"name"=>"total", "display_name"=>"total", "data_type"=>"decimal", "options"=>"{\"max_digits\":\"15\",\"max_decimals\":\"3\"}", "default"=>nil}, {"name"=>"order_shipment_state", "display_name"=>"order_shipment_state", "data_type"=>"varchar", "options"=>"{\"string_length\":\"200\"}", "default"=>nil}, {"name"=>"order_payment_state", "display_name"=>"order_payment_state", "data_type"=>"varchar", "options"=>"{\"string_length\":\"200\"}", "default"=>nil}, {"name"=>"variant_name", "display_name"=>"variant_name", "data_type"=>"varchar", "options"=>"{\"string_length\":\"200\"}", "default"=>nil}, {"name"=>"variant_sku", "display_name"=>"variant_sku", "data_type"=>"varchar", "options"=>"{\"string_length\":\"200\"}", "default"=>nil}, {"name"=>"variant_price", "display_name"=>"variant_price", "data_type"=>"decimal", "options"=>"{\"max_digits\":\"15\",\"max_decimals\":\"3\"}", "default"=>nil}, {"name"=>"variant_weight", "display_name"=>"variant_weight", "data_type"=>"decimal", "options"=>"{\"max_digits\":\"15\",\"max_decimals\":\"3\"}", "default"=>nil}, {"name"=>"variant_height", "display_name"=>"variant_height", "data_type"=>"decimal", "options"=>"{\"max_digits\":\"15\",\"max_decimals\":\"3\"}", "default"=>nil}, {"name"=>"variant_width", "display_name"=>"variant_width", "data_type"=>"decimal", "options"=>"{\"max_digits\":\"15\",\"max_decimals\":\"3\"}", "default"=>nil}, {"name"=>"variant_depth", "display_name"=>"variant_depth", "data_type"=>"decimal", "options"=>"{\"max_digits\":\"15\",\"max_decimals\":\"3\"}", "default"=>nil}, {"name"=>"variant_master", "display_name"=>"variant_master", "data_type"=>"boolean", "options"=>"\"\"", "default"=>nil}, {"name"=>"variant_total", "display_name"=>"variant_total", "data_type"=>"decimal", "options"=>"{\"max_digits\":\"15\",\"max_decimals\":\"3\"}", "default"=>nil}, {"name"=>"variant_quantity", "display_name"=>"variant_quantity", "data_type"=>"integer", "options"=>"\"\"", "default"=>nil}, {"name"=>"in_stock", "display_name"=>"in_stock", "data_type"=>"boolean", "options"=>"\"\"", "default"=>nil}, {"name"=>"cost_price", "display_name"=>"cost_price", "data_type"=>"decimal", "options"=>"{\"max_digits\":\"15\",\"max_decimals\":\"3\"}", "default"=>nil}, {"name"=>"description", "display_name"=>"description", "data_type"=>"text", "options"=>"\"\"", "default"=>nil}, {"name"=>"image_url", "display_name"=>"image_url", "data_type"=>"varchar", "options"=>"{\"string_length\":\"200\"}", "default"=>nil}, {"name"=>"shipment_id", "display_name"=>"shipment_id", "data_type"=>"integer", "options"=>"\"\"", "default"=>nil}, {"name"=>"shipment_number", "display_name"=>"shipment_number", "data_type"=>"varchar", "options"=>"{\"string_length\":\"200\"}", "default"=>nil}, {"name"=>"shipment_cost", "display_name"=>"shipment_cost", "data_type"=>"decimal", "options"=>"{\"max_digits\":\"15\",\"max_decimals\":\"3\"}", "default"=>nil}, {"name"=>"shipment_shipped_at", "display_name"=>"shipment_shipped_at", "data_type"=>"varchar", "options"=>"{\"string_length\":\"200\"}", "default"=>nil}, {"name"=>"shipment_state", "display_name"=>"shipment_state", "data_type"=>"varchar", "options"=>"{\"string_length\":\"200\"}", "default"=>nil}, {"name"=>"stock_location_name", "display_name"=>"stock_location_name", "data_type"=>"varchar", "options"=>"{\"string_length\":\"200\"}", "default"=>nil}, {"name"=>"billed_to_firstname", "display_name"=>"billed_to_firstname", "data_type"=>"varchar", "options"=>"{\"string_length\":\"200\"}", "default"=>nil}, {"name"=>"billed_to_lastname", "display_name"=>"billed_to_lastname", "data_type"=>"varchar", "options"=>"{\"string_length\":\"200\"}", "default"=>nil}, {"name"=>"billed_to_address1", "display_name"=>"billed_to_address1", "data_type"=>"varchar", "options"=>"{\"string_length\":\"200\"}", "default"=>nil}, {"name"=>"billed_to_city", "display_name"=>"billed_to_city", "data_type"=>"varchar", "options"=>"{\"string_length\":\"200\"}", "default"=>nil}, {"name"=>"billed_to_zipcode", "display_name"=>"billed_to_zipcode", "data_type"=>"varchar", "options"=>"{\"string_length\":\"200\"}", "default"=>nil}, {"name"=>"billed_to_phone", "display_name"=>"billed_to_phone", "data_type"=>"varchar", "options"=>"{\"string_length\":\"200\"}", "default"=>nil}, {"name"=>"billed_to_company", "display_name"=>"billed_to_company", "data_type"=>"varchar", "options"=>"{\"string_length\":\"200\"}", "default"=>nil}, {"name"=>"billed_to_state", "display_name"=>"billed_to_state", "data_type"=>"varchar", "options"=>"{\"string_length\":\"200\"}", "default"=>nil}, {"name"=>"billed_to_country", "display_name"=>"billed_to_country", "data_type"=>"varchar", "options"=>"{\"string_length\":\"200\"}", "default"=>nil}, {"name"=>"shipped_to_firstname", "display_name"=>"shipped_to_firstname", "data_type"=>"varchar", "options"=>"{\"string_length\":\"200\"}", "default"=>nil}, {"name"=>"shipped_to_lastname", "display_name"=>"shipped_to_lastname", "data_type"=>"varchar", "options"=>"{\"string_length\":\"200\"}", "default"=>nil}, {"name"=>"shipped_to_address1", "display_name"=>"shipped_to_address1", "data_type"=>"varchar", "options"=>"{\"string_length\":\"200\"}", "default"=>nil}, {"name"=>"shipped_to_city", "display_name"=>"shipped_to_city", "data_type"=>"varchar", "options"=>"{\"string_length\":\"200\"}", "default"=>nil}, {"name"=>"shipped_to_zipcode", "display_name"=>"shipped_to_zipcode", "data_type"=>"varchar", "options"=>"{\"string_length\":\"200\"}", "default"=>nil}, {"name"=>"shipped_to_phone", "display_name"=>"shipped_to_phone", "data_type"=>"varchar", "options"=>"{\"string_length\":\"200\"}", "default"=>nil}, {"name"=>"shipped_to_company", "display_name"=>"shipped_to_company", "data_type"=>"varchar", "options"=>"{\"string_length\":\"200\"}", "default"=>nil}, {"name"=>"shipped_to_state", "display_name"=>"shipped_to_state", "data_type"=>"varchar", "options"=>"{\"string_length\":\"200\"}", "default"=>nil}, {"name"=>"shipped_to_country", "display_name"=>"shipped_to_country", "data_type"=>"varchar", "options"=>"{\"string_length\":\"200\"}", "default"=>nil}, {"name"=>"order_created_at", "display_name"=>"order_created_at", "data_type"=>"datetime", "options"=>"{\"date_format\":\"Month,Day,Year\",\"time_format\":\"hh:mm\"}", "default"=>nil}, {"name"=>"order_updated_at", "display_name"=>"order_updated_at", "data_type"=>"datetime", "options"=>"{\"date_format\":\"Month,Day,Year\",\"time_format\":\"hh:mm\"}", "default"=>nil}, {"name"=>"order_completed_at", "display_name"=>"order_completed_at", "data_type"=>"datetime", "options"=>"{\"date_format\":\"Month,Day,Year\",\"time_format\":\"hh:mm\"}", "default"=>nil}]
			expect(@spree_data_source.create_field_str).to eql(expected_fields)
		end
	end

	describe "#get_options(datatype)"	do
		it "should return fields str" do
			expect(@spree_data_source.get_options('varchar')).to eql("{\"string_length\":\"200\"}")
			expect(@spree_data_source.get_options('decimal')).to eql("{\"max_digits\":\"15\",\"max_decimals\":\"3\"}")
			expect(@spree_data_source.get_options('datetime')).to eql("{\"date_format\":\"Month,Day,Year\",\"time_format\":\"hh:mm\"}")
			expect(@spree_data_source.get_options('integer')).to eql("\"\"")
		end
	end

	describe "#get_type(datatype)"	do
		it "should return fields str" do			
			expect(@spree_data_source.get_type('varchar')).to eql("string")
			expect(@spree_data_source.get_type('text')).to eql("text")
			expect(@spree_data_source.get_type('decimal')).to eql("number")
			expect(@spree_data_source.get_type('float')).to eql("number")
			expect(@spree_data_source.get_type('integer')).to eql("number")
			expect(@spree_data_source.get_type('datetime')).to eql("datetime")
			expect(@spree_data_source.get_type('date')).to eql("date")
			expect(@spree_data_source.get_type('boolean')).to eql("boolean")			
		end
	end			
end
