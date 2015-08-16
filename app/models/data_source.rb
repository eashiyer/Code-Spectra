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
require 'date_time_format_parser'
class DataSource < AuditedModel
  attr_accessible :dimensions_str, :groups_str, :content, :fields_str, :name, :data_source_type, :account_id, :load_count, :enabled,
                  :data_types_updated, :unique_str, :index_str, :file_upload_state, :sheets_array, 
                  :ignored_str, :updated_at, :account_template_id
                  
  has_many :data_contents, :dependent => :destroy, :order => 'created_at DESC'
  has_and_belongs_to_many :charts
  has_one :query_data_source, :dependent => :destroy
  has_one :spree_data_source, :dependent => :destroy
  belongs_to :account
  belongs_to :account_template
  has_many :charts_data_sources
  has_many :rules, :dependent => :destroy
  has_many :user_filters, :dependent => :destroy

  validates_uniqueness_of :name, :scope => :account_id
  before_create :check_limit

  DATA_CONTENT_COUNT = 5

  # File upload States
  TEMPFILE_CREATED = 1
  SHEET_SELECTED = 2
  UPLOADED_TO_REDIS = 3
  RULE_APPLIED = 4
  UPLOADED_TO_DB = 5

  def check_limit
    if self.account.data_sources.length && self.account.data_sources_limit && self.account.data_sources.length < self.account.data_sources_limit
       return true
    else
       return false
    end 
  end

  def fields_str
      unless self.read_attribute(:fields_str)  
         return $redis.get("fields_#{self.id}")  
      end
      self.read_attribute(:fields_str)
  end

  def fields_map
    JSON.parse(self.fields_str, quirks_mode: true)
  end

  def fields
    fields_map = self.fields_map
    fields_map.map { |fm| fm["name"] }
  end

  def populate_content
  	self[:content]    = "" #self.data_contents.map { |dc| dc.content.encode!('UTF-8', :undef => :replace, :invalid => :replace, :replace => "") }.join("\n")
    self[:dimensions_str] = self.dimensions_str.encode!('UTF-8', :undef => :replace, :invalid => :replace, :replace => "") if self.dimensions_str
    self[:fields_str] = self.fields_str.encode!('UTF-8', :undef => :replace, :invalid => :replace, :replace => "") if self.fields_str
  end

  def get_content_as_hash
    content = self.data_contents.map { |dc| dc.content.encode!('UTF-8', :undef => :replace, :invalid => :replace, :replace => "") }.join("\n")
    csv_data = CSV.parse(content)
    keys = csv_data[0]
    data = csv_data.slice(1, csv_data.length)
    data.map { |d| Hash[ keys.zip(d) ] }
  end

  def addContents(files, sheet_name = nil)
    files.each do |file|
      filename = file.original_filename
      tag = file.original_filename
      size =  (file.size)/1024
      format = self.data_source_type #file.content_type.gsub('text/', '')
      # deal with excel file...
      if File.extname(file.original_filename) == '.csv'
        content = File.read(file.tempfile, :encoding => 'windows-1251:utf-8')
      elsif File.extname(file.original_filename) == '.xlsx'
        content = get_excel_content(file, sheet_name, 'xlsx')
        format = file.content_type.gsub('application/', '')
      elsif File.extname(file.original_filename) == '.xls'
        content = get_excel_content(file, sheet_name, 'xls')       
        format = file.content_type.gsub('application/', '')
      else
        Rails.logger.debug 'Data File format not supported!'
        return false
      end
      if self.data_contents.present?
        content = self.remodelled_content(content) if self.rules.present?
        return false unless  excel_columns_equal?(content)       
        self.createContent(filename, format, content, tag, size, self.fields_str, JSON.parse(self.unique_str))
      else
        self.createRedisData(filename, format, content, tag, size)
      end
    end 
  end

  def remodelled_content(content)
      rule = self.rules.last      
      contents = CSV.parse(content)
      fields_str = contents[0].map{|field| { field => 'string'}}
      m= ModelScript.new
      data = m.remodel_preview_data(fields_str.to_json, contents[1..contents.length].to_json, rule.rule_input,JSON.parse(rule.rule_output)['keys_column'],JSON.parse(rule.rule_output)['values_column'])        
  end

  #set default sheet name if present.
  def get_excel_content(file, sheet_name, type)
      excel = (type == 'xlsx') ? Roo::Excelx.new(file.path) : Roo::Excel.new(file.path)
      excel.default_sheet =  sheet_name unless sheet_name.nil?
      content = excel.to_csv
  end

  #this method checks if the columns in uploaded excel and fields_str are equal or not.
  def excel_columns_equal?(content)
    contents = CSV.parse(content)
    fields_arr = contents[0].map do |field|
      field.strip unless field.nil?
    end.compact
    saved_fields_arr = JSON.parse(self.fields_str).map{|f| f['name']}
    #saved_fields_arr = JSON.parse(self.fields_str).reduce({}, :merge).collect{|k,v| k}.concat(JSON.parse(self.ignored_str))
    return fields_arr.uniq.sort == saved_fields_arr.uniq.sort      
  end

  #this method is used to save the data temporarily into redis cache.
  def createRedisData(filename, format, content, tag, size)
    contents = CSV.parse(content)
    fields_arr = contents[0].map do |field|
      field.strip unless field.nil?
    end
    fields_arr = fields_arr.select do |field|
      !field.nil?
    end

    fields = fields_arr.map do |field|
      { 'name' => field, 'data_type' => 'string'}
    end  

    $redis.set("fields_#{self.id}", fields.to_json)
    $redis.set("preview_data_#{self.id}", {"data" => contents[1..25], "length" => contents.length}.to_json)    
    $redis.set("filename_#{self.id}", filename)
    $redis.set("format_#{self.id}", format)
    $redis.set("tag_#{self.id}", tag)
    $redis.set("size_#{self.id}", size)

    $redis.set("content_#{self.id}", content) 
    self.update_attributes(:file_upload_state => UPLOADED_TO_REDIS) 
  end

  def createContent(filename, format, content, tag, size, table_fields, unique_keys)
    contents = CSV.parse(content)
    fields_arr = contents[0].map do |field|
      field.strip unless field.nil?
    end
    fields_arr = fields_arr.select do |field|
      !field.nil?
    end
    fields = []

    JSON.parse(table_fields).each do |hash|
      if hash['data_type'] == 'decimal'
        data_type = "#{hash['data_type']}(#{JSON.parse(hash['options'])['max_digits']},#{JSON.parse(hash['options'])['max_decimals']})"
      elsif hash['data_type'] == 'varchar'
        data_type = "#{hash['data_type']}(#{JSON.parse(hash['options'])['string_length']})"
      else 
        data_type = hash['data_type']
      end
        fields << {"fieldName" => hash['name'], "fieldType" => data_type, "defaultValue" => hash['default']}   
    end    
    # JSON.parse(table_fields).each do |hash|
    #     hash.map{ |k,v| fields << {"fieldName" => k, "fieldType" => v} }    
    # end
    # fields = fields_arr.map do |field|
    #   {"fieldName" => field,}
    # end
    
    table_name = self.table_name
    cibids = Cibids.new

    puts "Creating Table"
    if self.query_data_source && self.query_data_source.import_type == 1 && !self.data_contents.empty?
      table_name = "#{table_name}_temp"
    end
    created = cibids.create_table(table_name, fields, unique_keys)
    added = false
    puts "Created Table"
    if created
      ActiveRecord::Base.transaction do
        if self.query_data_source && self.query_data_source.import_type == 1 && !self.data_contents.empty?
          dc = self.data_contents.first
          dc.update_attributes(:filename => filename,
              :format   => format,
              :content => nil,
              :tag => tag,
              :size => size || content.length / 1024)
        else
          dc = DataContent.create(
              :filename => filename,
              :format   => format,
              :data_source => self,
              :content => nil,
              :tag => tag,
              :size => size || content.length / 1024
            )
        end

        if self.rules.present? && !self.data_types_updated
            rule = self.rules.last
            m= ModelScript.new
            data = m.remodel_table_data($redis.get("fields_#{self.id}"), contents[1..contents.length].to_json, rule.rule_input,JSON.parse(rule.rule_output)['keys_column'],JSON.parse(rule.rule_output)['values_column'])
        else
            data = contents[1..contents.length]
           data = data.map {|a| Hash[ fields_arr.zip(a) ] }
        end
 
        #column_types = JSON.parse(table_fields).inject(:update)

        column_types = {}
        column_format = {}
        column_default = {}
        JSON.parse(table_fields).each do |t|
          column_types[t['name']] = t['data_type']
          column_format[t['name']] = t['options']
          column_default[t['name']] = t['default']
        end
                                       
        begin
          table_data = data.map do |d|
            data_row = d.map do |k, v|
              if column_types[k] == 'varchar' || column_types[k] == 'varchar(200)'
                type = 'string'
                value = v
              elsif ['int','decimal','decimal(15,3)'].include?(column_types[k])
                type = 'number'
                if(v)
                  value = (column_types[k] == 'decimal' || column_types[k] == 'decimal(15,3)') ?  v.gsub(/[^0-9\.\-]+/, '').to_f : (column_types[k] == 'int') ? v.gsub(/[^0-9\.\-]+/, '').to_i : v
                else
                  # TODO: CHANGE THIS TO PASS NULL INSTEAD OF ZERO
                  value = v
                end
              elsif column_types[k] == 'date'
                type = 'date'
                if(v)
                  format = JSON.parse(column_format[k])
                  #format_str = "%m/%d/" + (v =~ /\d{4}/ ? "%Y" : "%y")
                  
                  value = DateTimeFormatParser.get_formatted_date(v, format["date_format"])
                else
                  value = v
                end
              elsif column_types[k] == 'time'
                type = 'time'
                if(v)
                  format = JSON.parse(column_format[k])
                  value = DateTimeFormatParser.get_formatted_time(v, format)
                else
                  value = v
                end                  
              elsif column_types[k] == 'datetime'
                type = 'datetime'                
                if(v)
                    format = JSON.parse(column_format[k])
                    value = DateTimeFormatParser.get_formatted_datetime(v, format) 
                else
                  value = v
                end                                
              else                
                type = column_types[k]
                value = v
              end
              
              #get default value if val is no present.  
              value = (value.nil? || value.blank?) ? column_default[k] : value 
              {"type" => type, "key" => k, "value" => value}
            end
            data_row.push({"type" => "string", "key" => "data_content_id", "value" => dc.id})
          end
          added = cibids.add_data(table_name, table_data, self.id, unique_keys)
        rescue => e
          cibids.drop_table(table_name)
          dc.destroy
          self.rules.delete_all if !self.rules.nil?
          return e.message
        end
        if added
          if self.query_data_source && self.query_data_source.import_type == 1 && !self.data_contents.empty?
            cibids.replace_table(self.table_name, table_name)
          end
          if !self.fields_str || self.fields_str.nil?
            #convert the fields_arr to array of hashes for iss achitecture.
            #fields_arr_new = fields_arr.map {|x| Hash[x, 'string']} 
            return self.update_attributes!(:fields_str => table_fields, :file_upload_state => 4, :data_types_updated => true) 
          end
        else
          raise ActiveRecord::Rollback
          added = false
        end
      end
    end

    added
  end

  def table_name
    "#{self.id}_contents"
  end

  def get_lat_lon_fields
    ret = {}    
    fields = self.fields
    if fields 
      # lat_field = fields.select { |field_hash| field_hash.keys[0].downcase == "lat" || field_hash.keys[0].downcase == "latitude" } 
      lat_field = fields.select { |f| f.downcase == "lat" || f.downcase == "latitude"}
      if lat_field.length > 0
        ret["lat"] = lat_field[0]
      end

      lon_field = fields.select { |f| f.downcase == "lon" || f.downcase == "longitude"}
      if lon_field.length > 0
        ret["lon"] = lon_field[0]
      end
    end

    ret
  end

  def update_data_types(fields_str)
    fields_str = JSON.parse(fields_str);
    fields_str.keep_if {|x| x.values[0] != 'string' }
  end
  
  def create_temp_file(file, sheets)
    # create a temporay file if number of sheets are grater than 1
      name = "#{self.id}_#{file.original_filename}"
      dir = "/tmp/xls_upload"
      path = File.join(dir, name)

      #create a directory if it doesn't exist
      FileUtils.mkdir_p(dir) unless File.directory?(dir)

      File.open(path, "wb") { |f| f.write(file.read) }
      $redis.set("tempfile_path_#{self.id}", path)
      update_attributes(:file_upload_state => DataSource::TEMPFILE_CREATED, :sheets_array => sheets.to_json)      
  end

  #create a dumy file upload object using ActionDispatch::Http::UploadedFile from tempfile
  def create_file_to_upload
    file_path = $redis.get("tempfile_path_#{self.id}")
    tempfile = File.open(file_path,'r')

    file = ActionDispatch::Http::UploadedFile.new({
      :tempfile => File.new(tempfile)
    })
    file.original_filename = File.basename(file_path).split("_", 2).last
    file.content_type = "application/#{File.basename(file_path).split('.').last}"  
    file
  end 

  def delete_tempfile
      File.delete($redis.get("tempfile_path_#{self.id}")) #delete the temporary file
      $redis.del("tempfile_path_#{self.id}")
  end  

  def preview_data
    return $redis.get("preview_data_#{self.id}")
  end

  def preview_headers    
    fields = $redis.get("fields_#{self.id}")
  end

  def clear_redis_cache
      $redis.del("fields_#{self.id}")
      $redis.del("filename_#{self.id}")
      $redis.del("format_#{self.id}")
      $redis.del("content_#{self.id}")
      $redis.del("tag_#{self.id}")
      $redis.del("size_#{self.id}")
      $redis.del("preview_data_#{self.id}") 
  end  

  def init
    @conditionsMap = []
    @dimensionsMap = []
    @factMap = []
    @filters = @filters || []
    @sec_conditions = []    
    @sortMap = []
    @selectionMap = []
    @display_rank = false
  end  

  def get_preview_data(chart_type, dimensions_obj, measures_obj, sort_key, sort_order, limit)
    cibids = Cibids.new

    table_name = "#{self.id}_contents"

    @sort_key = sort_key
    @sort_order = sort_order
    @limit = limit

    self.init   

    dimensions_obj.each do |d|  
      @dimensionsMap << {
        "fieldName" => d["field_name"],
        "formatAs" => d["format_as"],
        "displayName" => d["display_name"],
      }
    end

    measures_obj.each do |m|
      @factMap << {
        "fieldName" => m["field_name"],
        "formatAs" => m["format_as"],
        "displayName" => m["display_name"],
      }
    end

    dimensions_obj.each do |dimension|
      if dimension["sort_order"] && !dimension["sort_order"].blank?
        @sortMap << {"fieldName" => dimension["field_name"], "formatAs" => dimension["format_as"], "sortOrder" => dimension["sort_order"]}
      end
    end 
    measures_obj.each do |measure|
      if measure["sort_order"] && !measure["sort_order"].blank?
        @sortMap << {"fieldName" => measure["field_name"], "formatAs" => measure["format_as"], "sortOrder" => measure["sort_order"]}
      end
    end 
    

    @results = cibids.get_data(self, table_name, @dimensionsMap, @factMap, @sortMap, @sort_order, @limit, nil, @sec_conditionsMap, @display_rank, @selectionMap)

    if chart_type.to_i == 7
      @total = cibids.get_total(table_name)
      return [{ "results" => @results, "count" => @total }]
    end

    #self.format_results(@factMap, @dimensionsMap)
    
    @results    
  end  

  def format_results(factMap, dimensionsMap)    
    @results = @results.each do |result|  
      factMap.each do |fact|    
        
        fact_str = self.get_fact_str(fact) # "#{fact["formatAs"]}(`#{fact["fieldName"]}`)"
        val = result[fact_str].to_f         
        if @sec_operation == '%'
          if sec_result
            sec_val = sec_result[fact_str].to_f         
          else
            sec_val = 0
          end 
          val = sec_val * 100.0 / val       
        end     

        unless(fact["fieldName"] == @dimension )
          format_as_key = fact["formatAs"] == "" ? "noformat" : fact["formatAs"]
          result["#{fact["fieldName"]}"] = {} unless result["#{fact["fieldName"]}"] && format_as_key != "noformat"
          # result["#{fact["fieldName"]}"][format_as_key] = {} unless result["#{fact["fieldName"]}"][format_as_key]
          result["#{fact["fieldName"]}"][format_as_key] = val.to_s
        end               
      end     
    end   

    @results
  end

  def preview_results(user_query, data_connection_id)
    puts("PREVIEWING")
    data_connection=DataConnection.find(data_connection_id)
    results = data_connection.execute(user_query, true)
    results
  end

  protected
  def get_fact_str(fact)
    "#{fact["formatAs"]}(`#{fact["fieldName"]}`)"
  end
end
