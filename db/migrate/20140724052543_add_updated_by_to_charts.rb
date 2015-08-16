class AddUpdatedByToCharts < ActiveRecord::Migration
  def change
    add_column :charts, :updated_by, :string
  end
end
