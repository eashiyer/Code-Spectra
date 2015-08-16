# == Schema Information
#
# Table name: comments
#
#  id          :integer          not null, primary key
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  message     :text
#  author_name :string(255)
#  author_id   :integer
#  status      :integer          default(0)
#  chart_id    :integer
#

class Comment < ActiveRecord::Base
	attr_accessible :message, :author_name, :author_id, :status, :chart_id
	belongs_to :chart	

	validates_presence_of :author_name, :message, :chart_id
end
