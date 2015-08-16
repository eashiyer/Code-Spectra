class AddAccountTemplateId < ActiveRecord::Migration
  def change
    add_column :data_sources, :account_template_id, :integer
    add_column :verticals, :account_template_id, :integer
    add_column :dashboards, :account_template_id, :integer
    add_column :charts, :account_template_id, :integer
    add_column :dimensions, :account_template_id, :integer
    add_column :measures, :account_template_id, :integer
    add_column :charts_data_sources, :account_template_id, :integer
  end
end
