# == Schema Information
#
# Table name: charts
#
#  id                  :integer          not null, primary key
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  dashboard_id        :integer          not null
#  chart_type          :integer          not null
#  configs             :text
#  secondary_dimension :string(255)
#  title               :string(255)
#  subtitle            :string(255)
#  css_class_name      :string(255)      default("span")
#  width               :integer          default(600)
#  height              :integer          default(400)
#  margin_top          :integer          default(60)
#  margin_left         :integer          default(60)
#  margin_right        :integer          default(60)
#  margin_bottom       :integer          default(60)
#  modal_enabled       :boolean          default(FALSE)
#  modal_title         :string(255)      default("Summary")
#  is_hidden           :boolean          default(FALSE)
#  display_rank        :integer          default(0)
#  isolated            :boolean          default(FALSE)
#

class Chart < AuditedModel

  attr_accessible :chart_type, :configs, 
  				  :css_class_name, :width, :height, :modal_enabled,
            :modal_title, :margin_bottom, 
  				  :margin_right, :margin_left, :margin_top, :dashboard,
  				  :secondary_dimension,:dashboard_id, :title, :subtitle,
            :sort_by_key, :desc_order, :orientation_type, :drill_through_fields, 
            :excluded_rows, :axes_configs, :rows, :columns, :display_rank,
            :created_at, :updated_at, :updated_by, :account_template_id, :isolated, :description

  validates :chart_type, :dashboard_id, :presence => true

  belongs_to              :dashboard
  belongs_to              :account_template
  has_one                 :highlight_rule, :dependent => :destroy
  has_many                :comments, :dependent => :destroy
  has_many                :charts_data_sources, :dependent => :destroy
  has_many                :charts_users
  has_many                :chart_filters
  has_and_belongs_to_many :data_sources
  has_many                :dimensions, :dependent => :destroy,:order => :rank
  has_many                :measures, :dependent => :destroy
  

  
  TOTALS_KEY_TIMEOUT = 30  # 30 Minutes
  CHART_TYPE = [
    "ctable", #0
    "bar",    #1
    "pie",    #2
    "ctree",  #3
    "geo",    #4
    "heatmap", #5
    "combo",   #6
    "table",   #7
    "line",    #8
    "multiline", #9
    "hbar",      #10
    "area",       #11
    "stacked_area", #12
    "scatter_plot", #13
    "grouped_table", #14
    "single_value", #15
    "geo_india", #16
    "donut", #17
    "funnel", #18
    "geo_usa", #19
    "gauge" #20
  ]

  def self.chart_type(chart_name)
    return self::CHART_TYPE.index(chart_name)
  end

  def self.chart_name(chart_type)
    return self::CHART_TYPE[chart_type]
  end

  def create_chart(params)
    ActiveRecord::Base.transaction do
      if params[:charts_data_sources_str]
        charts_data_sources_params = JSON.parse(params[:charts_data_sources_str])
        params.delete(:charts_data_sources_str)        
      end
      if params[:chart_dimensions_str]
        chart_dimensions_params = JSON.parse(params[:chart_dimensions_str])
        params.delete(:chart_dimensions_str)        
      end
      if params[:chart_measures_str]
        chart_measures_params = JSON.parse(params[:chart_measures_str])
        params.delete(:chart_measures_str)        
      end
      charts_params = params
      charts_params[:chart_type] = Chart::chart_type(charts_params[:chart_type])

      chart = Chart.create!(charts_params)

      # Create CDS
      charts_data_sources_params.each do |cds_params|
        cds_params[:chart_id] = chart.id
        cds = ChartsDataSource.create!(cds_params)
      end
      # Create Measures
      chart_measures_params.each do |cm_params|
        cm_params[:chart_id] = chart.id
        Measure.create!(cm_params)
      end
      
      # Create Dimensions        
      chart_dimensions_params.each do |cd_params|
        cd_params[:chart_id] = chart.id
        Dimension.create!(cd_params)  
      end
      chart
    end
  end

  def update_chart(params, current_user)
    ActiveRecord::Base.transaction do
        if params[:charts_data_sources_str] 
          charts_data_sources_params = JSON.parse(params[:charts_data_sources_str])      
        end
        if params[:chart_dimensions_str]
          chart_dimensions_params = JSON.parse(params[:chart_dimensions_str])      
        end
        if params[:chart_measures_str]
          chart_measures_params = JSON.parse(params[:chart_measures_str])      
        end   
        params.delete(:charts_data_sources_str)
        params.delete(:chart_dimensions_str)
        params.delete(:chart_measures_str)           
        charts_params = params  
        chart_user_setting = current_user.charts_users.find_by_chart_id(self.id)
        unless chart_user_setting
          chart_user_setting = ChartsUser.new(:chart => self, :user => current_user)
        end
        chart_user_setting.width  = params[:width]
        chart_user_setting.height = params[:height]
        chart_user_setting.save!
        params.delete(:width)
        params.delete(:height)
        self.update_attributes(charts_params)

      # Create CDS
      charts_data_sources_params.each do |cds_params|
        self.charts_data_sources.first.update_attributes(cds_params)
      end if charts_data_sources_params

      # Create Measures
      chart_measures_params.each do |cm_params|
        measure_id = cm_params['field_id']
        cm_params.delete('field_id')       
        if measure_id.nil?
          cm_params[:chart_id] = self.id
          Measure.create!(cm_params)
        else
          m = Measure.find(measure_id)
          m.update_attributes(cm_params)          
        end                
      end if chart_measures_params
      
      # Create Dimensions        
      chart_dimensions_params.each do |cd_params|
        dimension_id = cd_params['field_id']
        cd_params.delete('field_id')            
        if dimension_id.nil?
          cd_params[:chart_id] = self.id
          Dimension.create!(cd_params)           
        else
          d = Dimension.find(dimension_id)
          d.update_attributes(cd_params)
        end 
      end if chart_dimensions_params   
      self  
    end
  end

  def vertical
    self.dashboard.vertical
  end

  def apply_user_preferences(user)
    chart_user_setting = user.charts_users.find_by_chart_id(self.id)
    if chart_user_setting
      self.width = chart_user_setting.width
      self.height = chart_user_setting.height
    end    
    self
  end

  def data(filters)
    charts_data_sources = self.charts_data_sources
    # Generate Query For each chart data source & get results
    results = {}
    charts_data_sources.each do |cds|
      results[cds.id] = cds.chart_data(filters)
    end

    # ---
    # IMLPEMENT IN MEMORY JOIN ON DIFFERENT RESULT SETS
    # ---
    dimension_values = []
    
    # Collect dimension values from each result set
    charts_data_sources.each do |cds|
      vals = results[cds.id].map { |r| r[cds.dimension_name] }.uniq
      dimension_values = vals if dimension_values.empty?

      # Get only the common dimension values 
      dimension_values = dimension_values & vals
    end

    # FILTER OUT THE VALUES BASED ON COMMON VALUES
    charts_data_sources.each do |cds|  
      results[cds.id] = results[cds.id].select { |result| dimension_values.include? result[cds.dimension_name] }
    end

    results
  end

  def subscribers
    self.dashboard.users
  end

  def data_sources
    self.charts_data_sources.map { |cds| cds.data_source }
  end

  def chart_data (filters, is_underlying_data=FALSE, option_value=nil)    
    data_source = self.charts_data_sources[0].data_source
    # chart_dimension = self.charts_data_sources[0].dimension_name.strip
    # dimension_format = self.charts_data_sources[0].dimension_format_as
    if !is_underlying_data && self.drill_through_fields && self.drill_through_fields != ""
      drill_through_fields = self.drill_through_fields.split(",").to_json 
    else
      drill_through_fields = nil
    end
    results=self.charts_data_sources[0].raw_data(filters.to_json,nil,nil,nil,nil,drill_through_fields,is_underlying_data,option_value)    
    
    results[0]["results"]
  end

  def set_unique_values(unique_values)
    # current_unique_values = self.unique_values
    unique_values = [] if unique_values.nil?
    # unique_values  = (current_unique_values + unique_values).uniq
    $redis.setex(self.chart_unique_vals_key, Chart::TOTALS_KEY_TIMEOUT, unique_values.to_json)
  end

  def unique_values
    val = $redis.get(self.chart_unique_vals_key)
    val = val ? JSON.parse(val) : []    
  end

  def chart_unique_vals_key
    "chart_unique_values_#{self.id}"
  end

  def active_chart_filters
    ChartFilter.where('chart_id = ? and disabled = ?', self.id, false)
  end

end
