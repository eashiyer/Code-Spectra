class CreateDataContents < ActiveRecord::Migration
  def up
    create_table :data_contents do |t|
      t.timestamps
      t.string  :filename
      t.string  :format
      # Remove into another table
      t.text    :content, :limit => 10.megabyte 
      t.string  :tag
      t.integer :data_source_id
    end
  end

  def down
  	drop_table :data_contents
  end
end
