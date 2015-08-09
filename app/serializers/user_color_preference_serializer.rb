class UserColorPreferenceSerializer < ActiveModel::Serializer
  	embed :ids
  	attributes :color_theme, :bar, :line, :area, :error_bar, :control_key, :statistical_relevance
    has_one :user
end
