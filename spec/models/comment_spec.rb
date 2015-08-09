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

require 'spec_helper'

describe Comment do
  it { should belong_to(:chart) }
  it { should validate_presence_of(:message) }
  it { should validate_presence_of(:chart_id) }
  it { should validate_presence_of(:author_name) }
end
