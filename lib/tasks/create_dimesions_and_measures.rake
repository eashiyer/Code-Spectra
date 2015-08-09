namespace :database do
	desc "Rake task to to convert array to hash in field_str field"
	task :separate_dimensions_and_measures => :environment do
		ActiveRecord::Base.transaction do
			puts "Separating database fields."		
			separate_dimensions_and_measures
		end
	end
end

def separate_dimensions_and_measures
	charts = Chart.where('dashboard_id is not ?', nil)
	charts.each do |chart|
		next if (chart.dimensions.present? || chart.measures.present?)
		cds = chart.charts_data_sources
		cd = cds.first
		next unless cd
		puts chart.id
		chart_type = chart.chart_type	
		if [1,5,6].include?(chart_type)		#charts with multiple datasources				
			if cd.dimension_name.present?
				ActiveRecord::Base.transaction do
					dim_display_name = cd.dimension_format_as ? "#{cd.dimension_format_as.upcase} of #{cd.dimension_name}" : cd.dimension_name
					Dimension.create!(:field_name => cd.dimension_name, 
									  :format_as => cd.dimension_format_as, 
									  :display_name => dim_display_name,
									  :chart_id => cd.chart.id)			
					cds.each do |cd|
						fact_display = cd.fact_display.present? ? cd.fact_display : cd.fact;
						fact_display_name = cd.fact_format.present? ? "#{cd.fact_format.upcase} of #{fact_display}" : fact_display
						Measure.create!(:field_name => cd.fact, 
										:format_as => cd.fact_format, 
										:display_name => fact_display_name,
										:is_calculated => cd.is_calculated,
										:chart_id => cd.chart.id)				

					end
					cds[1..cds.length].each do |cd|
						cd.destroy
					end
				end
			end
		elsif [15].include?(chart_type)	#single value
			if cd.fact.present?	
				ActiveRecord::Base.transaction do	
					fact_display = cd.fact_display.present? ? cd.fact_display : cd.fact;
					fact_display_name = cd.fact_format.present? ? "#{cd.fact_format.upcase} of #{fact_display}" : fact_display
					Measure.create!(:field_name => cd.fact, 
									:format_as => cd.fact_format, 
									:display_name => fact_display_name,
									:is_calculated => cd.is_calculated,
									:chart_id => cd.chart.id)
				end
			end
		elsif [7].include?(chart_type)	#table chart
			configs = JSON.parse(chart.configs) if chart.configs
			if configs
				ActiveRecord::Base.transaction do
					if configs['hierarchy'].present?
						configs['hierarchy'].each do |h|
							Measure.create!(:field_name => h, 
											:format_as => nil, 
											:display_name => h,
											:is_calculated => nil,
											:chart_id => cd.chart.id)
						end		
					end
				end
			end
		elsif [0,3].include?(chart_type) #ctable, ctree
			configs = JSON.parse(chart.configs) if chart.configs
			if configs
				ActiveRecord::Base.transaction do
					if configs['hierarchy'].present?
						configs['hierarchy'].each do |h|					
							Dimension.create!(:field_name => h, 
											  :format_as => nil, 
											  :display_name => h,
											  :chart_id => cd.chart.id)
						end	
					end		
					if cd.fact.present?		
						fact_display = cd.fact_display.present? ? cd.fact_display : cd.fact;
						fact_display_name = cd.fact_format.present? ? "#{cd.fact_format.upcase} of #{fact_display}" : fact_display
						Measure.create!(:field_name => cd.fact, 
										:format_as => cd.fact_format, 
										:display_name => fact_display_name,
										:is_calculated => cd.is_calculated,
										:chart_id => cd.chart.id)
					end
				end
			end
		else
			if cd.dimension_name.present?
				ActiveRecord::Base.transaction do
					dim_display_name = cd.dimension_format_as ? "#{cd.dimension_format_as.upcase} of #{cd.dimension_name}" : cd.dimension_name
					Dimension.create!(:field_name => cd.dimension_name, 
									  :format_as => cd.dimension_format_as, 
									  :display_name => dim_display_name,
									  :chart_id => cd.chart.id)

					fact_display = cd.fact_display.present? ? cd.fact_display : cd.fact;
					fact_display_name = cd.fact_format.present? ? "#{cd.fact_format.upcase} of #{fact_display}" : fact_display
					Measure.create!(:field_name => cd.fact, 
									:format_as => cd.fact_format, 
									:display_name => fact_display_name,
									:is_calculated => cd.is_calculated,
									:chart_id => cd.chart.id)

					if cd.depth
						fact_display = cd.fact_display ? cd.fact_display : cd.depth
						Dimension.create!(:field_name => cd.depth, 
								    :format_as => nil, 
									:display_name => fact_display,
									:chart_id => cd.chart.id)
					end
				end			
			end
		end
	end
end


