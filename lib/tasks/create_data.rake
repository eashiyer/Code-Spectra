namespace :configs do
	desc "Rake task to generate starter configs"
	task :load => :environment do
		puts Rails.env;
		puts "Resetting database and reloading configuration"
		Rake::Task['db:reset'].invoke
		client = "dot";
		file = "#{Rails.root}/lib/tasks/seed_data/#{client}.yml"
		configs = YAML::load( File.open(file) );
		unless configs
			puts "Unable to load configs. Check if file exists #{file}"
			exit;
		end
		configs = configs["configs"];
		verticals = configs["verticals"]
		ActiveRecord::Base.transaction do
			verticals.each do |vertical|
				v = Vertical.create(
						:name => vertical['name']
					)
				data = vertical["data"]
				data.each do |c|
					filename = "#{c['filename']}"
					content = File.read(filename, :encoding => 'windows-1251:utf-8')
					puts content.length
					d = DataSource.create(
							:name => c['name'],
							:filename => filename,
							:format => c['format'],
							:dimensions_str => c['dimensions'].to_json,
							:groups_str => c['group'].to_json,
							:content => File.read(filename, :encoding => 'windows-1251:utf-8')
						)
					dash_count = 0;
					c['dashboards'].each do |dash|
						dashboard = Dashboard.create(
								:title 		  => dash['title'] ? dash['title'] : "",
								:subtitle 	  => dash['subtitle'] ? dash['subtitle'] : "",
								:display_rank => ++dash_count,
								:display_name => dash['display_name'] ? dash['display_name'] : ""
							)
						dash['charts'].each do |ch| 
							Chart.create(
									:chart_type => ch['chart_type'],
									:dimension_name => ch['dimensionName'],
									:group_name => ch['groupName'],
									:secondary_dimension => ch['secondaryDimension'] ? ch['secondaryDimension'] : "",
									:configs => ch.to_json,
									:dashboard => dashboard,
								)
						end
						d.dashboards << dashboard
					end
					v.data_sources << d
				end
			end

		end
	end

end


# => DATA SOURCE  
# => t.string :name
# => t.string :filename
# => t.string :format
# => t.text :content, :limit => 10.megabyte

# DASHBOARDS
# => t.string  :title
# => t.string  :subtitle
# => t.integer :display_rank
# => t.string  :display_name
# => t.integer :data_source_id 

# CHART
# => t.integer :type, 			 :null => false
# => t.string  :dimension_name
# => t.string  :group_name
# => t.binary 	:configs, 		 :limit => 256.kilobytes

# => t.string  :css_class_name, :default => "span12"
# => t.integer :width,     	 :default => 600
# => t.integer :height,     	 :default => 400
# => t.integer :margin_top,     :default => 40
# => t.integer :margin_left,    :default => 40
# => t.integer :margin_right,   :default => 40
# => t.integer :margin_bottom,  :default => 40

