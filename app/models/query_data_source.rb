# == Schema Information
#
# Table name: query_data_sources
#
#  id                 :integer          not null, primary key
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  query              :text
#  frequency          :integer
#  data_connection_id :integer
#  data_source_id     :integer
#  last_run_at        :datetime
#  enabled            :boolean          default(TRUE)
#

class QueryDataSource < AuditedModel
  attr_accessible :query, :frequency, :last_run_at, :enabled, 
            :data_source_id, :data_connection_id, :adapter, 
            :import_type, :bookmark_key, :bookmark_comparison_operator, 
            :last_run_successful, :last_run_status, :created_at, :unsuccessfull_count

  belongs_to :data_source
  belongs_to :data_connection
  
  OVERWRITE = 1
  APPEND = 2

  def execute
  	begin
      if(self.bookmark_key && self.bookmark_comparison_operator)
        bookmark_parameters={}
        bookmark_parameters["bookmark_key"]=self.bookmark_key
        bookmark_parameters["bookmark_comparison_operator"]=self.bookmark_comparison_operator
        bookmark_parameters["bookmark_value"]=self.bookmark_value
        bookmark_parameters["bookmark_key_type"]=self.data_source.fields_map.select{|f| f["name"]==self.bookmark_key}[0]["data_type"]        
      end
      Rails.logger.error "\nQDS=#{self.id} Query=#{query}"
  		results = self.data_connection.execute(query, false, bookmark_parameters)
      unless results.nil? || results.empty?
        results_as_csv = (results.map { |h| h.values.to_csv }.flatten.join(''))
        csv_string = results[0].keys.to_csv + results_as_csv        
        data_type_string = self.data_source.fields_str
        unique_str=JSON.parse(self.data_source.unique_str || "{}")    
        content_created=self.data_source.createContent("db query", "csv", csv_string, "", nil, data_type_string, unique_str)        
        if(content_created==true)
          self.last_run_at = Time.now
          self.last_run_successful = true
          self.last_run_status = "Successfully Completed"
          self.unsuccessfull_count = 0
          self.save
          self.touch
          self.data_source.touch
          csv_string
        else
          raise content_created.to_s
        end
      end
  	rescue Exception => e
  		Rails.logger.error e.to_s
      puts e.to_s
      count = self.unsuccessfull_count
      if count >= 4
        count = count + 1
        enabled = false
      else
        count = count + 1
        enabled = true
      end
      self.update_attributes(:last_run_at => Time.now, :last_run_successful => false, :last_run_status => e.to_s, :enabled => enabled, :unsuccessfull_count => count) 
  		return []
  	end
  end

  def run_query
	# Get last_run_at
	# Get Frequency
	# If Time.now > last_run_at + frequency
	# execute  	
  end

  def self.run
  end

  # def get_data_type(value)
  #   ruby_data_type = value.class.to_s
  #   case ruby_data_type
  #   when "Float"
  #     return "decimal(15,3)"
  #   when "Fixnum"
  #     return "integer"      
  #   else "String"
  #     return "varchar(200)"
  #   end      
  # end

  def bookmark_value
    table_name=self.data_source.table_name
    cibids=Cibids.new
    @bookmark_value=cibids.get_bookmark_value(table_name, self.bookmark_key, self.bookmark_comparison_operator)
    return @bookmark_value
  end

end
