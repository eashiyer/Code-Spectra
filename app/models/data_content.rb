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

class DataContent < ActiveRecord::Base
  attr_accessible :filename, :format, :content, :tag, :data_source_id, :data_source, :size
  belongs_to :data_source
  
#  before_save :populate_fields
#  after_find :format_date
#  before_save :convert_content_to_json
#  after_find  :convert_content_to_hash

  # def creation_time
  #    self.created_at.strftime("%d %h %Y %H:%M")
  # end

  # def populate_fields
  #   contents = CSV.parse(self.content)
  #   if self.data_source.fields_str
  #     self.content = contents[1..contents.length].map {|c| c.to_csv}.join("")
  #   else
  #     fields_str = contents[0].to_json
  #     self.data_source.update_attributes!(:fields_str => fields_str) 
  #   end

  # end

  # def convert_content_to_hash
  # 	self.content = YAML::load(self.content)
  # end

  # def convert_content_to_json
  # 	case self.format
  # 	when 'json'
  # 		return
  # 	when 'csv'
  # 		convert_csv_to_json
  # 	else
  # 		puts 'Un supported Format'
  # 	end
  # end

  # def convert_csv_to_json
  # 	csv_data = CSV.parse(self.content)
  # 	keys = csv_data[0]
  # 	data = csv_data.slice(1, csv_data.length)
  # 	self.content = YAML::dump(data.map {|d| Hash[ keys.zip(d) ] })
  # end

  def destroy_and_update
    cibids = Cibids.new
    ds = self.data_source
    ActiveRecord::Base.transaction do
      table_name = ds.table_name
      
      if(ds.data_contents.length == 1)
        deleted = cibids.drop_table(table_name)
        
        # This is the only data content this data_source has!
        ds.fields_str = nil
        ds.dimensions_str = nil
        ds.unique_str = nil
        ds.file_upload_state = nil
        ds.sheets_array = nil
        ds.data_types_updated = false
        ds.save!

        #remove rules if any
        ds.rules.delete_all if ds.rules
        
      else
        deleted = cibids.delete_data(table_name, self.id)  
      end
      unless deleted
        raise ActiveRecord::Rollback
      end

      self.destroy
    end
  end
  
end

