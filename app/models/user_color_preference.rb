class UserColorPreference < ActiveRecord::Base
  attr_accessible :color_theme, :bar, :line, :area, :error_bar, :control_key, :statistical_relevance, :user_id

  belongs_to :user
end
