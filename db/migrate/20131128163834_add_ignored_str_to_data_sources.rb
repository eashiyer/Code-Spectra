class AddIgnoredStrToDataSources < ActiveRecord::Migration
  def change
    add_column :data_sources, :ignored_str, :string
  end
end
