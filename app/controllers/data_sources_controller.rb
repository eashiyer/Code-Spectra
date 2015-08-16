class DataSourcesController < AuthController
  before_filter :auth_only!    
	respond_to :json
  
	def index    
    if(params[:chart_ids])
      @data_sources = DataSource.joins(:charts).where('charts.id' => params[:chart_ids])
    else
      # All users can get a list of data_sources to be able to create & see charts!
      @data_sources = current_user.account.data_sources      
      @excluded_data_sources = current_user.get_excluded_data_sources
      @data_sources = @data_sources.reject { |ds| @excluded_data_sources.include?(ds) }
    end
		render :json => @data_sources,  :each_serializer  => DataSourceIndexSerializer
	end

	def show
		@data_source = DataSource.find(params[:id])
    
    if(@data_source.account != current_user.account)
      render json: {}, status: 401    
      return    
    end
    
    @data_source.populate_content unless params[:summary]
		render :json => @data_source
	end

	def create    
        unless current_user.is_admin?
          render json: {}, status: 401    
          return
        end

        unless params[:data_source][:account_id]
          render json: {}, status: 400
          return
        end

        unless params[:data_source][:account_id].to_i == current_user.account_id
          render json: {}, status: 401
          return
        end


        # Uploaded File
        # To read contents of the file
        # File.read(params[:files][0].tempfile) 
        @data_source = DataSource.new()
        @data_source.name = params[:data_source][:name]
        @data_source.data_source_type = params[:data_source][:data_source_type]
        @data_source.account_id = params[:data_source][:account_id]
        
      	if @data_source.save
          @data_source.populate_content unless params[:summary]
      		render :json => @data_source
      	else
  		    Rails.logger.debug @data_source.errors.full_messages.join("\n")
        	# render :json => {
        	# 	'message' => 'unable to save'
        	# }
          render :json => {:errors => { :name => 'DataSources limit exceeded' }}, :status => 422
      	end
  end

	def update
    unless current_user.is_admin?
      render json: {}, status: 401    
      return
    end

		@data_source = DataSource.find(params[:id])
    
    if(@data_source.account != current_user.account)
      render json: {}, status: 401    
      return    
    end

    data_source_params = params[:data_source]
    
    unless data_source_params[:account_id]
        # Ember weirdness - Doesn't send back the model id at times
        data_source_params[:account_id] = current_user.account_id
    end

    if data_source_params[:rules_str]
      rules_str = JSON.parse(data_source_params[:rules_str])
      rule_input = rules_str["combine_columns"]
      rule_output = {:keys_column => rules_str["keys_column"],:values_column => rules_str["values_column"]}
      params_hash = {:rule_input => rule_input, :rule_output => rule_output.to_json, :rule_type => 1} 
      @data_source.rules.build(params_hash)      
    end

    created_response = false
    if !@data_source.data_types_updated && ![1,3].include?(@data_source.file_upload_state) && !data_source_params[:rules_str] && (@data_source.file_upload_state == 4 && data_source_params[:file_upload_state] == 4 )
      #get data from redis cache 

      filename = $redis.get("filename_#{@data_source.id}")
      format = $redis.get("format_#{@data_source.id}")
      content = $redis.get("content_#{@data_source.id}")
      tag = $redis.get("tag_#{@data_source.id}")
      size = $redis.get("size_#{@data_source.id}")
      
      fields = data_source_params[:fields_str]
      unique_keys = data_source_params[:unique_str] ? JSON.parse(data_source_params[:unique_str]) : []
      #send the content to api to create table data 

      api_response = @data_source.createContent(filename, format, content, tag, size, fields, unique_keys)


      if api_response != true
        data_source_params[:fields_str] = nil
        data_source_params[:file_upload_state] = nil
      elsif api_response == true
        data_source_params[:data_types_updated] = true
      end

      #clear redis cache
      @data_source.clear_redis_cache

      # $redis.del("fields_#{@data_source.id}")
      # $redis.del("filename_#{@data_source.id}")
      # $redis.del("format_#{@data_source.id}")
      # $redis.del("content_#{@data_source.id}")
      # $redis.del("tag_#{@data_source.id}")
      # $redis.del("size_#{@data_source.id}")
      # $redis.del("preview_data_#{@data_source.id}")            
    end

    data_source_params.delete(:content) if data_source_params.has_key?(:content)
    data_source_params.delete(:preview_data) if data_source_params.has_key?(:preview_data)
    data_source_params.delete(:preview_headers) if data_source_params.has_key?(:preview_headers)
    data_source_params.delete(:rules_str) if data_source_params.has_key?(:rules_str)
    data_source_params.delete(:query_data_source_id) if data_source_params.has_key?(:query_data_source_id)
    data_source_params.delete(:spree_data_source_id) if data_source_params.has_key?(:spree_data_source_id)


      if @data_source.update_attributes(data_source_params)
          if !api_response.nil? && api_response != true
            render :json => {:errors => {:name => api_response} }, :status => 422
          else
            render :json => @data_source, :serializer => DataSourceUpdateSerializer, root: "data_source"
          end
    	else
      	Rails.logger.debug @data_source.errors.full_messages.join("\n")
      	render :json => {
      		'message' => 'unable to save'
      	}
    	end

	end

  def addContent
    unless current_user.is_admin?
      render json: {}, status: 401    
      return
    end

    @data_source = DataSource.find(params[:id])
    #@data_source.update_attributes(:data_types_updated => false, :fields_str => nil)

    if(@data_source.account != current_user.account)
      render json: {}, status: 401    
      return    
    end

    # if the extension include xlsx or xls then check number of sheets  
    file = params[:files].first    
    if ['.xlsx', '.xls'].include?(File.extname(file.original_filename))
      xls_file = (File.extname(file.original_filename) == '.xlsx') ? Roo::Excelx.new(file.path) :  Roo::Excel.new(file.path)
      if xls_file.sheets.length > 1
        @data_source.create_temp_file(file, xls_file.sheets)
        render json: {}
        return 
      end
    end

    if @data_source.addContents(params[:files]  )
      @data_source.populate_content unless params[:summary]
      @data_source.touch
      render :json => @data_source
    else
      Rails.logger.debug @data_source.errors.full_messages.join("\n")
      render json: {:message => 'Wrong Data Format!'}, status: 400
    end
  end

  # this method is used to retrive data from the temporarily saved file
  def addCachedFileContent
    unless current_user.is_admin?
      render json: {}, status: 401    
      return
    end

    @data_source = DataSource.find(params[:id])

    if(@data_source.account != current_user.account)
      render json: {}, status: 401    
      return    
    end

    # we need a file object in addContent method
    # that's why create fake file object to send to addContent method
    file = @data_source.create_file_to_upload

    if @data_source.addContents([file],params[:sheet_name])
      @data_source.populate_content
      @data_source.touch      
      @data_source.delete_tempfile
      render :json => @data_source
    else
      Rails.logger.debug @data_source.errors.full_messages.join("\n")
      render json: {:message => 'Wrong Data Format!'}, status: 400
    end
  end

  def destroy
    data_source = DataSource.find params[:id]
    cibids=Cibids.new
    if cibids.drop_table("#{data_source.id}_contents")
      data_source.destroy
    end
    respond_to do |format|
      format.json { head :no_content }
    end
  end

  def modelPreviewData
      model_script = ModelScript.new
      data_source = DataSource.find(params[:id])
      fields_str = data_source.fields_str
      preview_data = data_source.preview_data
      remodelled_data = model_script.remodel_preview_data(fields_str, preview_data, params[:combine_columns], params[:new_keys_column], params[:new_values_column])
      render :json => CSV.parse(remodelled_data)
  end

  def getUploadProgress
    count = $redis.get("rec_count_#{params[:id]}")
    if count.to_i > 100
      $redis.set("rec_count_#{params[:id]}", 0)
    end
    render :json => {:count => count}
  end
  
  def clearRedisCache
    data_source = DataSource.find(params[:id])
    data_source.clear_redis_cache
    data_source.rules.delete_all if !data_source.rules.nil?
    render :json => {message: 'success'}
  end

  def uniqueKeys 
    field = params[:field]

    formatAs = params[:formatAs] || ''
    ds = DataSource.find(params[:id])
    
    arr = []
    if ds.fields.include?(field)
      table_name = "#{ds.id}_contents"
      cibids = Cibids.new
      keys = cibids.get_unique_keys(table_name, field, formatAs, ds.updated_at)
      if keys
        keys.each do |k|
          arr << k[field]
        end
      end   
    end
    render :json => {'keys' => arr}
  end

  def preview_results
    @data_source = DataSource.find(params[:id])
    query = params[:query]
    data_connection_id = params[:dataConnectionId]
    begin
      preview_results = @data_source.preview_results(query, data_connection_id)  
    rescue Exception => e
      msg=e.message
    end
    if msg
      return render :json => {message: msg}, :status => 422
    end
    if preview_results
      render :json => preview_results
    else
      format.json { head :no_content, status: :error }
    end
  end

  def create_table
    puts("Creating table")
    data_source = DataSource.find(params[:id])
    
    if params[:fields_arr]
      table_fields = JSON.parse(params[:fields_arr])
    end
    if params[:fields_str]
      table_fields =  JSON.parse(params[:fields_str])
      data_source.update_attributes(:fields_str => table_fields.to_json, :file_upload_state => 4, :data_types_updated => true)
    end

    uniqueKeys=[]
    if params[:unique_keys]
      uniqueKeys=JSON.parse(params[:unique_keys])
    end
    
    table_name = data_source.table_name
    fields = []
    table_fields.each do |hash|
      if hash['data_type'] == 'decimal'
        data_type = "#{hash['data_type']}(#{JSON.parse(hash['options'])['max_digits']},#{JSON.parse(hash['options'])['max_decimals']})"
      elsif hash['data_type'] == 'varchar'
        data_type = "#{hash['data_type']}(#{JSON.parse(hash['options'])['string_length']})"
      else 
        data_type = hash['data_type']
      end
        fields << {"fieldName" => hash['name'], "fieldType" => data_type, "defaultValue" => hash['default']}   
    end
    cibids = Cibids.new
    created = cibids.create_table(table_name, fields, uniqueKeys)
    if created
      render :json => {message: created}, status: 200
    else
      render :json => {message: 'Table creation failed'}, :status => 422
    end    
  end

  def create_data_source
    user = User.find_by_authentication_token(params[:cibi_token])

    unless user.is_admin?
      render json: {}, status: 401    
      return
    end

    ds={}
    ds['name']=params[:name]
    ds['account_id']=user.account_id
    
    @data_source = DataSource.create(ds)

    if @data_source
      render :json => {:Datasource_id => @data_source.id}
    else
      Rails.logger.debug @data_source.errors.full_messages.join("\n")
      render :json => {:errors => { :name => 'DataSources limit exceeded' }}, :status => 422
    end
  end

  def data_source_exists
    user = User.find_by_authentication_token(params[:cibi_token])

    unless user.is_admin?
      render json: {}, status: 401    
      return
    end
    
    @data_source = DataSource.find_by_name_and_account_id(params[:name], user.account_id)

    if @data_source
      render :json => {:data_source_id => @data_source.id}
    else
      render :json => {:errors => { :name => 'DataSource does not exist' }}, :status => 422
    end
  end

  def add_data
    @data_source=DataSource.find(params[:id])

    data=JSON.parse(params[:data])
    column_names = data.first.keys
    content=CSV.generate do |csv|
      csv << column_names
      data.each do |x|
        csv << x.values
      end
    end

    table_fields=@data_source.fields_str
    unique_keys=JSON.parse(@data_source.unique_str || "[{}]")

    content_created=@data_source.createContent("api request", "csv", content, "", nil, table_fields, unique_keys)
    if(content_created==true)
      @data_source.touch
      render :json => {message: 'Data added successfully'}, status: 200
    else
      render :json => {message: content_created.to_s}, :status => 422
    end
  end

  def getDataContents
    page_no = params[:pageno].to_i
    unless page_no == 0
      offset =(page_no - 1) * 5
    end
    if page_no == 1
      total_content = DataContent.where("data_source_id = ?",params[:id]).count
      data_contents = DataContent.where("data_source_id = ?",params[:id]).limit(5).offset(offset)
      render json: {"data_contents" => data_contents,"count" => total_content}
    else
      data_contents = DataContent.where("data_source_id = ?",params[:id]).limit(5).offset(offset)
      render json: {"data_contents" => data_contents}
    end
  end

  def fetch_data
    d = DataSource.find(params[:id])
    if d.query_data_source.execute
      render :json => {message: 'success'}
    end
  end
end
