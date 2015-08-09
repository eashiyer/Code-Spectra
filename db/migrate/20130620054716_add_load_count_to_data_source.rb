class AddLoadCountToDataSource< ActiveRecord::Migration
  def change
    add_column :data_sources, :load_count, :integer
  end
end
