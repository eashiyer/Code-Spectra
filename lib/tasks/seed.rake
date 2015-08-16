namespace :database do
	desc "Rake task to generate starter configs"
	task :seed => :environment do
		# Populate Data Sources
		ActiveRecord::Base.transaction do
			puts "Resetting database and reloading configuration"
			Rake::Task['db:reset'].invoke			
			Rake::Task['db:fixtures:load'].invoke			
			populate_data_sources
			populate_data_contents
			populate_charts
		end
	end
end

def populate_data_sources
	data_sources_file = "#{Rails.root}/lib/tasks/seed_data/data_sources.yml"
	data_sources_configs = YAML::load( File.open(data_sources_file) );
	data_sources_configs.each do |data_source_config|
		name  = data_source_config["name"]
		group_str  = data_source_config["group"].to_json
		dimension_str =  data_source_config["dimensions"].to_json
		ds = DataSource.create(
				:name => name,
				:groups_str => group_str,
				:dimensions_str => dimension_str
			)
	end
end

def populate_data_contents
	data_contents_file = "#{Rails.root}/lib/tasks/seed_data/data_contents.yml"
	data_contents_configs = YAML::load( File.open(data_contents_file) );
	data_contents_configs.each do |data_content_config|
		filename       = data_content_config["filename"]
		format         = data_content_config["format"]
		data_source_id = data_content_config["data_source_id"]
		content        = File.read("#{Rails.root}/#{filename}", :encoding => 'windows-1251:utf-8')
		tag            = data_content_config["tag"] || ""
		size           = File.size("#{Rails.root}/#{filename}")/1024
		dc = DataContent.create(
				:filename => filename,
				:format   => format,
				:data_source_id => data_source_id,
				:content => content,
				:tag => tag,
				:size => size
			)
	end
end

def populate_charts
	charts_file = "#{Rails.root}/lib/tasks/seed_data/charts.yml"
	charts_configs = YAML::load( File.open(charts_file) );
	charts_configs.each do |chart_config|
		dashboard_id  = chart_config["dashboard_id"]
		width =  chart_config["width"]
		height =  chart_config["height"]
		css_class_name = chart_config["css_class_name"]
		margin_top = chart_config["margin"]["top"]
  		margin_left = chart_config["margin"]["left"]
  		margin_right = chart_config["margin"]["right"]
  		margin_bottom = chart_config["margin"]["bottom"]
  		chart_type = Chart::chart_type(chart_config["chart_type"])
  		title = chart_config["title"]
  		subtitle = chart_config["subtitle"]
  		configs = chart_config.to_json

		c = Chart.create(
				:chart_type => chart_type,
				:dashboard_id => dashboard_id,
				:configs => configs,
				:width => width,
				:height => height,
				:css_class_name => css_class_name,
				:margin_bottom => margin_bottom,
				:margin_right => margin_right,
				:margin_left => margin_left,
				:margin_top => margin_top,
				:title => title,
				:subtitle => subtitle
			)
	end
end