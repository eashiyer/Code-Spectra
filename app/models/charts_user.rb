class ChartsUser < ActiveRecord::Base
  attr_accessible :chart, :user, :width, :height
  belongs_to :user
  belongs_to :chart
end
