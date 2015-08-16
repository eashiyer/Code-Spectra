class SpreeDataSource < AuditedModel
  attr_accessible :store_name, :store_url, :api_token, :frequency_of_import, :data_source_id,
  				  :last_run_at, :last_run_successful, :last_run_status, :import_type, :enabled, :created_at
  belongs_to :data_source
  
  validates_presence_of :store_name, :store_url, :api_token

  #to run the fetch orders manually use the following method
  # def self.get_spree_data
  #   	# https://mega-market-5303.spree.mx
  #   	# 46ab2aa91ff1fdb2f84411c0d5bc7ad245f2264ce7d0580e
  #  	spree_data_sources = SpreeDataSource.all
  #  	spree_data_sources.each do |spree_data_source|
  # 		spree_data_source.fetch_spree_sales
  # 	end
  # end  

  def create_table
  	fieldStr = create_field_str
  	ds = self.data_source
  	ds.update_attributes(:fields_str => fieldStr.to_json, :data_types_updated => true, :file_upload_state => 4)

  	fields = get_fields(fieldStr)
    unique_key = 'id'
  	cibids = Cibids.new
    created = cibids.create_table("#{self.data_source_id}_contents", fields, [unique_key])
  end 

  # Update spree sales Method
  def fetch_spree_sales
    begin
      
      cibids = Cibids.new
      table_name = "#{self.data_source_id}_contents"
      last_updated_time = cibids.get_bookmark_value(table_name,'order_updated_at', '>')
      time = last_updated_time ? Time.parse(last_updated_time) : (Time.now - self.frequency_of_import.minutes)
      # Curling the url
      url= self.store_url + '/api/orders.json?token=' + self.api_token + "&q[updated_at_gteq]=" + time.strftime("%Y-%m-%dT%H:%M:%S.%LZ")

      orders = Curl.get(url)
      order_tokens = get_order_tokens(orders.body_str)
      #table_cols = YAML.load_file("tableconfig.yml")['sales']
      unless order_tokens.nil? || order_tokens.empty?
        dc = DataContent.create(
              :filename => self.store_name,
              :format   => 'spree',
              :data_source => self.data_source,
              :content => nil,
              :tag => nil,
              :size => nil
            )

        order_tokens.each do |order_number,order_token|
          SpreeDataSourceSalesWorker.perform_async(self.id, order_number, order_token, dc.id)
          #fetch_and_save_spree_sales(order_number, order_token, dc.id)
        end

      end
      
    rescue Exception => e
      Rails.logger.error e.to_s
      puts e.to_s
      # self.update_attributes(:last_run_at => Time.now, :last_run_successful => false, :last_run_status => e.to_s)       
      # self.data_source.touch
    end
  end   

  def fetch_and_save_spree_sales(order_number, order_token, data_content_id)
      begin
          
          cibids = Cibids.new
          table_name = "#{self.data_source_id}_contents"
          # orders_url= self.store_url + '/api/orders/'+order_number+'?order_token=' + order_token
          orders_url= self.store_url + '/api/orders/'+order_number+'?order_token=' + order_token + "&token=#{self.api_token}"
          orders = Curl.get(orders_url)

          items = get_spree_sales(orders.body_str)
          sales_array = JSON.parse(items)['sales'] unless items.nil? 
          unless sales_array.nil? || sales_array.empty?
            table_data = get_table_data(items, data_content_id)
            cibids.add_data(table_name, table_data, self.id, ['id'])
          end
          self.update_attributes(:last_run_at => Time.now, :last_run_successful => true)
          self.data_source.touch
      rescue Exception => e
          Rails.logger.error e.to_s
          puts e.to_s
          self.update_attributes(:last_run_at => Time.now, :last_run_successful => false, :last_run_status => e.to_s)       
          self.data_source.touch
      end
  end

  def get_order_tokens(response_str)
    data_hash = JSON.parse(response_str)
    order_tokens = {}
    data_hash["orders"].collect{|h| order_tokens[h['number']] = h['token']}
    order_tokens
  end

  def get_spree_sales(response_str) 
    data_hash = JSON.parse(response_str)

    if data_hash.nil? || data_hash['error']
      return
    end
    line_items = data_hash['line_items'] 
    line_items.each do |item|
      variant = item.delete('variant')
      variant.each do |k, v|
        k = get_key_name(k)
        item[k] = v  
      end  

      item.merge!({'image_url'=> item['images'][0]['small_url']}) unless item["images"].nil? || item["images"].empty?
      item.merge!({
                   'variant_total'=> item['total'],
                   'variant_quantity'=> item['quantity']
                   })
      item.merge!({'order_number'=> data_hash['number'], 
                   'order_created_at'=> data_hash['created_at'], 
                   'order_updated_at'=> data_hash['updated_at'],
                   'order_completed_at'=> data_hash['comleted_at'], 
                   'state'=> data_hash['state'],
                   'order_shipment_state'=> data_hash['shipment_state'],
                   'order_payment_state'=> data_hash['order_payment_state'],
                   'channel'=>data_hash['channel'],
                   'currency'=>data_hash['currency'],
                   'quantity'=>data_hash['total_quantity']                  
                   })
      bill_address =  data_hash['bill_address']
      unless bill_address.nil? || bill_address.empty?
        item.merge!({'billed_to_firstname'=> bill_address['firstname'],
                     'billed_to_lastname'=> bill_address['lastname'],
                     'billed_to_address1'=> bill_address['address1'],
                     'billed_to_city'=> bill_address['city'],
                     'billed_to_zipcode'=> bill_address['zipcode'],
                     'billed_to_phone'=> bill_address['phone'],
                     'billed_to_company'=> bill_address['company'],
                     'billed_to_state'=> bill_address['state']['name'],
                     'billed_to_country'=> bill_address['country']['name']
                     })
      end
      ship_address = data_hash['ship_address']
      unless ship_address.nil? || ship_address.empty?
        item.merge!({'shipped_to_firstname'=> ship_address['firstname'],
                     'shipped_to_lastname'=> ship_address['lastname'],
                     'shipped_to_address1'=> ship_address['address1'],
                     'shipped_to_city'=> ship_address['city'],
                     'shipped_to_zipcode'=> ship_address['zipcode'],
                     'shipped_to_phone'=> ship_address['phone'],
                     'shipped_to_company'=> ship_address['company'],
                     'shipped_to_state'=> ship_address['state']['name'],
                     'shipped_to_country'=> ship_address['country']['name']
                     })
      end

      shipments = data_hash['shipments']
      unless shipments.nil? || shipments.empty? 
        shipments.each do |sh|
        ids = sh['manifest'].map{|mn| mn['variant']['id']}
          if ids.include?(item['variant_id'])
                item.merge!({'shipment_id'=> sh['id'],
                             'shipment_number'=> sh['number'],
                             'shipment_cost'=> sh['cost'],
                             'shipment_shipped_at'=> sh['shipped_at'],
                             'shipment_state'=> sh['state'],
                             'stock_location_name'=> sh['stock_location_name'],
                             })
          end
        end
      end
    end unless line_items.nil? || line_items.empty?    
    {'sales' => line_items }.to_json
  end

  def get_key_name(key)
      case key
      when 'name'
        k = 'variant_name'
      when 'price'
        k = 'variant_price'   
      when 'sku'
        k = 'variant_sku' 
      when 'weight'
        k = 'variant_weight' 
      when 'height'
        k = 'variant_height'
      when 'width'
        k = 'variant_width' 
      when 'depth'
        k = 'variant_depth'                   
      when 'is_master'
        k = 'variant_master'                                
      else
        k = key
      end  
      k  
  end

  def get_table_data(response_str, data_content_id)
    #data_content_id = self.data_source.data_contents.first.id
    data_hash = JSON.parse(response_str) if response_str
    if data_hash.nil? || data_hash['sales'].nil?
      return
    end
    import_type = self.import_type

    table_cols = YAML.load_file("tableconfig.yml")["#{import_type}"]
    table_data = []
    case import_type
    when 'sales'
      orders_count = data_hash['sales'].count
    else
      orders_count = data_hash.count
    end

    # orders_count = import_type == 'orders' ? data_hash["count"] : data_hash.count
    for i in 0..orders_count-1
      arr = []
      table_cols.each do |k,v| 
        hash = {}
        type = get_type(v)
        hash['type'] = type
        hash['key'] = k
        hash['value'] = get_value(data_hash["#{import_type}"][i][k], type) 
        arr << hash        
      end
      arr << {"type" => "string", "key" => "data_content_id", "value" => data_content_id}
      table_data << arr      
    end
    table_data
  end

  def get_value(val, type)
    if val
      value = type == 'datetime' ? Time.parse(val).strftime('%Y/%m/%d %H:%M:%S') : val
    else
      value = nil
    end
    value
  end

  def get_fields(fieldStr)
    fields = []
    fieldStr.each do |hash|
      if hash['data_type'] == 'decimal'
        data_type = "#{hash['data_type']}(#{JSON.parse(hash['options'])['max_digits']},#{JSON.parse(hash['options'])['max_decimals']})"
      elsif hash['data_type'] == 'varchar'
        data_type = "#{hash['data_type']}(#{JSON.parse(hash['options'])['string_length']})"
      else 
        data_type = hash['data_type']
      end
        fields << {"fieldName" => hash['name'], "fieldType" => data_type, "defaultValue" => hash['default']}   
    end
    fields
  end

  def create_field_str  	  	
  	# Reading table configuration from YAML file
  	orders = YAML.load_file("tableconfig.yml")
  	arr = []    
  	orders["#{self.import_type}"].each do |k,v |
  		 hash = {}
  		 hash['name'] = k
  		 hash['display_name'] = k
  		 hash['data_type'] = v
  		 hash['options'] = get_options(v)
  		 hash['default'] = nil
  		 arr.push(hash)		 
  	end
  	arr
  end

  def get_options(datatype)
  	option = {}
  	if datatype == 'varchar'
  		option["string_length"] = "200"
  	elsif datatype == 'decimal'
  		option["max_digits"] = "15"
  		option["max_decimals"] = "3"
    elsif datatype == 'datetime'
      option["date_format"] = "Month,Day,Year"
      option["time_format"] = "hh:mm" 
  	else
  		option = ""
  	end
  	option.to_json
  end

  def get_type(datatype)
  	if datatype == 'varchar'
  		type = 'string'
    elsif datatype == 'text'
      type = 'text'      
  	elsif ['decimal','float','integer'].include?(datatype)
  		type = 'number'
  	elsif datatype == 'date'
  		type = 'date'
    elsif datatype == 'datetime'
      type = 'datetime'
    else 
      type = datatype
  	end
  	type
  end

end
