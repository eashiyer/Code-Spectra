class AccountTemplate < ActiveRecord::Base
	attr_accessible :account_id, :status, :template_inputs, :template_name
	belongs_to 	:account
	has_many	:data_sources, :dependent => :destroy
	has_many	:verticals, :dependent => :destroy
	has_many	:dashboards, :dependent => :destroy
	has_many	:charts, :dependent => :destroy
	has_many	:charts_data_sources, :dependent => :destroy
	has_many	:dimensions, :dependent => :destroy
	has_many	:measures, :dependent => :destroy

  	def apply_template
  		begin
  			if self.template_name == "Spree Commerce"
				@manifest=YAML.load_file("config/initializers/templates/spree_commerce_manifest.yml")["spree_commerce"]
			end
			create_data_sources
			create_workspaces	
  		rescue Exception => e
  			raise e
  		end		
	end

	def create_data_sources
		# create data source object
		data_sources = @manifest["modules"]["sales"]["data_sources"]			
		if data_sources && data_sources.length > 0
			template_inputs=JSON.parse(self.template_inputs)
			data_sources.each do |ds|
		       	@data_source = DataSource.new()
		        @data_source.name = "#{template_inputs["store_name"]}-#{ds["data_source_name"]}"
		        @data_source.data_source_type = ds["data_source_type"]
		        @data_source.account_id = User.current_user.account.id
		        @data_source.account_template_id = self.id
		      	if @data_source.save
		          	@data_source.populate_content unless ds["summary"]
		          	# update account_template status
		      	else
		  		    raise @data_source.errors.full_messages.join("\n")
		      	end 
			
				# create spree data source object					
				spreeDataSource = {};
				spreeDataSource['store_name'] = template_inputs["store_name"]
				spreeDataSource['frequency_of_import'] = ds["frequency"]
				spreeDataSource['store_url'] = template_inputs["store_url"]
				spreeDataSource['data_source_id'] = @data_source.id
				spreeDataSource['api_token'] =template_inputs["api_token"]
				if template_inputs["sales"] == true
					spreeDataSource['import_type'] = "sales"
				elsif template_inputs["inventory"] == true
					spreeDataSource['import_type'] = "inventory"
				end					
				spree_data_source = SpreeDataSource.new(spreeDataSource)
			  	if spree_data_source.save
			  		# create tables
			  		spree_data_source.create_table
			  		# update account_template status
			  	else
					raise spree_data_source.errors.full_messages.join("\n")
			  	end
		  	end	
		end	
	end

	def create_workspaces
		workspaces=@manifest["modules"]["sales"]["workspaces"]
		if workspaces && workspaces.length > 0
			template_inputs=JSON.parse(self.template_inputs)
			workspaces.each do |ws|
				@ws = ws
				@workspace = Vertical.new()
 				@workspace.name = "#{template_inputs["store_name"]}-#{ws['name']}"
				@workspace.account_id = User.current_user.account.id
				@workspace.account_template_id = self.id
				if @workspace.save
		            create_dashboards
		        else
		            raise @workspace.errors.full_messages.join("\n")
		        end
			end
		end
	end

	def create_dashboards
		dashboards = @ws['dashboards']
		if dashboards && dashboards.length > 0
			dashboards.each do |d|
				@d = d.clone
				d.delete("charts")
				d['vertical_id'] = @workspace.id
				d['account_template_id'] = self.id
				@dashboard = Dashboard.create!(d)
				if @dashboard
					create_charts
				else
					raise @dashboard.errors.full_messages.join("\n")
				end
			end
		end
	end

	def create_charts
		charts = @d['charts']
		if charts && charts.length > 0
			template_inputs = JSON.parse(self.template_inputs)
			charts.each do |c|
				@c=c.clone
				c.delete("dimensions")
				c.delete("measures")
				c.delete("data_source_name")
				c.delete("count")
				c['dashboard_id'] = @dashboard.id
				c['account_template_id'] = self.id
				@chart = Chart.create!(c)

				if @chart
					# create charts_data_sources
					@charts_data_source=ChartsDataSource.new()
					@charts_data_source.chart_id = @chart.id
					@charts_data_source.data_source_id = (DataSource.find_by_name_and_account_id("#{template_inputs["store_name"]}-#{@c['data_source_name']}", User.current_user.account.id)).id
					@charts_data_source.account_template_id = self.id
					@charts_data_source.count = @c['count'] || 5000
					@charts_data_source.save

					# create dimensions					
					if @c['dimensions'] && @c['dimensions'].length > 0
						dimensions = @c['dimensions'].clone
						dimensions.each do |dim|
							dim['chart_id'] = @chart.id
							dim['account_template_id'] = self.id
							@dimension = Dimension.create!(dim)
						end
					end

					# create measures					
					if @c['measures'] && @c['measures'].length > 0
						measures = @c['measures'].clone
						measures.each do |mes|
							mes['chart_id'] = @chart.id
							mes['account_template_id'] = self.id
							@measure = Measure.create!(mes)
						end
					end
				else
					raise @chart.errors.full_messages.join("\n")
				end
			end 
		end
	end
end
