class AddSizeToDataContent < ActiveRecord::Migration
  def change
    add_column :data_contents, :size, :float
  end
end
