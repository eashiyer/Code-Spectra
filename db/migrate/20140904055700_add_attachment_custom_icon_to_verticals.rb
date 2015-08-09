class AddAttachmentCustomIconToVerticals < ActiveRecord::Migration
  def self.up
    change_table :verticals do |t|
      t.attachment :custom_icon
    end
  end

  def self.down
    drop_attached_file :verticals, :custom_icon
  end
end
