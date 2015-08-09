namespace :demo do
	desc "Rake task to generate starter configs"
	task :seed => :environment do
		# Populate Data Sources
		ActiveRecord::Base.transaction do
			puts "Resetting database and reloading configuration"
			Rake::Task['db:reset'].invoke			
			Rake::Task['db:seed'].invoke			
			acc = Account.find_by_name("Cerebrate Inc")
			create_objects(acc)
			
		end
	end
end
        

def create_objects(acc)
	# Bank Loans
	ds = DataSource.create({
			:name => 'Bank Loans',
			:data_source_type => 'csv',
			:dimensions_str => ["Date","Branch Name","Loan Type"].to_json,
			:account => acc
		})
	puts "Created Data Source with Name = #{ds.name} & Id = #{ds.id}"
	content = File.read("#{Rails.root}/public/data/ssb/ssb_loans.csv", :encoding => 'windows-1251:utf-8')

	dc = DataContent.create({
          :filename => "loans.csv",
          :format   => 'csv',
          :data_source => ds,
          :content => content,
          :tag => '',
          :size => content.length / 1024
		})
	puts "Created Data Content with Data Source Id = #{dc.data_source_id} & Id = #{dc.id}"	


	# Banking Vertical
	v = Vertical.create({
			:name => 'Banking',
			:account => acc
		})
	puts "Created Vertical with name = #{v.name} & Id = #{v.id}"

	# Loans Dashboard
	d = Dashboard.create({
			:display_name => 'Loans',
			:title => 'Bank Loans',
			:vertical_id => v.id
		})
	puts "Created Dashboard with Vertical = #{d.vertical_id} & Id = #{d.id}"	

	# Loan Amount Per Quarter
	c = Chart.create({
			:title => 'Loan Amount Per Quarter',
			:subtitle => 'Rolling 6 Quarters',
			:chart_type => 1, # Bar
			:configs => {'y_axis_label' => 'Loan Amount', 'sort_by_key' => true}.to_json,			
			:width => 300,
			:height => 250,
			:margin_bottom => 50,
			:margin_top => 10,
			:margin_left => 50,
			:margin_right => 0,
			:dashboard_id => d.id
		})
	puts "Created Chart with Dashboard Id = #{c.dashboard_id} & Id = #{c.id}"		

	cds = ChartsDataSource.create({
			:chart_id => c.id,
			:data_source_id => ds.id,
			:dimension_name => 'Date',
			:dimension_format_as => 'Quarter',
			:fact => 'Loan Amount',
			:fact_type => 'money',
			:fact_unit => 'Rs',
			:fact_format => 'sum'
		})
	puts "Created Charts Data Source with Chart Id = #{cds.chart_id} & Id = #{cds.id}"			

	# Loan Amount Per Quarter
	c = Chart.create({
			:title => 'Loan Amount Per Branch Per Quarter',
			:subtitle => 'Rolling 6 Quarters',
			:chart_type => 9, # Multiline
			:configs => {'y_axis_label' => 'Loan Amount', 'sort_by_key' => true}.to_json,			
			:width => 300,
			:height => 250,
			:margin_bottom => 50,
			:margin_top => 10,
			:margin_left => 50,
			:margin_right => 0,
			:dashboard_id => d.id
		})
	puts "Created Chart with Dashboard Id = #{c.dashboard_id} & Id = #{c.id}"		

	cds = ChartsDataSource.create({
			:chart_id => c.id,
			:data_source_id => ds.id,
			:dimension_name => 'Date',
			:dimension_format_as => 'Quarter',
			:depth => 'Branch Name',
			:fact => 'Loan Amount',
			:fact_type => 'money',
			:fact_unit => 'Rs',
			:fact_format => 'sum'
		})
	puts "Created Charts Data Source with Chart Id = #{cds.chart_id} & Id = #{cds.id}"			

	# Loan Amount Per Quarter
	c = Chart.create({
			:title => 'Loan Amount Per Type Per Quarter',
			:subtitle => 'Rolling 6 Quarters',
			:chart_type => 1, # Bar
			:configs => {'y_axis_label' => 'Loan Amount', 'sort_by_key' => true}.to_json,			
			:width => 300,
			:height => 250,
			:margin_bottom => 50,
			:margin_top => 10,
			:margin_left => 50,
			:margin_right => 0,
			:dashboard_id => d.id
		})
	puts "Created Chart with Dashboard Id = #{c.dashboard_id} & Id = #{c.id}"		

	cds = ChartsDataSource.create({
			:chart_id => c.id,
			:data_source_id => ds.id,
			:dimension_name => 'Date',
			:dimension_format_as => 'Quarter',
			:depth => 'Loan Type',
			:fact => 'Loan Amount',
			:fact_type => 'money',
			:fact_unit => 'Rs',
			:fact_format => 'sum'
		})
	puts "Created Charts Data Source with Chart Id = #{cds.chart_id} & Id = #{cds.id}"			

end


