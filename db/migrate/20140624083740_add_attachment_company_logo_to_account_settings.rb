class AddAttachmentCompanyLogoToAccountSettings < ActiveRecord::Migration
  def self.up
    change_table :account_settings do |t|
      t.attachment :company_logo
    end
  end

  def self.down
    drop_attached_file :account_settings, :company_logo
  end
end
