class CreateUserColorPreferences < ActiveRecord::Migration
  def change
    create_table :user_color_preferences do |t|

      t.timestamps
      t.integer :color_theme
      t.string  :bar
      t.string  :line
      t.string  :area
      t.string  :error_bar
      t.string  :control_key
      t.string  :statistical_relevance
      t.belongs_to :user
      
    end
  end
end
