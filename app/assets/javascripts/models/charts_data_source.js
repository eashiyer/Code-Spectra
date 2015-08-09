/** @class Cibi.ChartsDataSource */

/**
  `Cibi.ChartsDataSource` is the `ChartDataSource` model

  A cds has following attributes: 

  `dimensionName, dimensionFormatAs, depth, count, fact, factType, factUnit, factFormat`

  In addition, a cds has following relationships:

  belongs_to chart, dataSource
  
  @class Cibi.ChartsDataSource
*/
Cibi.ChartsDataSource = DS.Model.extend({
	// dimensionName: DS.attr('string'),
	// dimensionFormatAs: DS.attr('string'),
	// depth: DS.attr('string'),
	count: DS.attr('number'),
	// fact: DS.attr('string'),
	factType: DS.attr('string'),
	isolated: DS.attr('boolean'),
	// factDisplay: DS.attr('string'),
	// factUnit: DS.attr('string'),
	// factFormat: DS.attr('string'),
	chart: DS.belongsTo('Cibi.Chart'),
	// isCalculated: DS.attr('boolean'),
	dataSource: DS.belongsTo('Cibi.DataSource'),
	accountTemplate: DS.belongsTo('Cibi.AccountTemplate'),

	dimensions:function(){
		if(this.get('chart')){
			return this.get('chart').get('dimensions');
		}
	}.property('chart.isSetup','chart.dimensions'),

	measures:function(){
		if(this.get('chart')){
			return this.get('chart').get('measures');
		}
	}.property('chart.isSetup','chart.measures'),

	dimensionName:function(){
		if(this.get('dimensions') && this.get('dimensions').get('length')>0){
			return this.get('dimensions').objectAt(0).get('fieldName');
		}
	}.property('chart.dimensions'),

	dimensionFormatAs:function(){
		if(this.get('dimensions') && this.get('dimensions').get('length')>0){
			return this.get('dimensions').objectAt(0).get('formatAs');
		}
	}.property('chart.isSetup','chart.dimensions'),

	dimensionDisplay: function(){
		if(this.get('dimensions') && this.get('dimensions').get('length')>0){
			return this.get('dimensions').objectAt(0).get('displayName');
		}
	}.property('chart.dimensions'),

	depth:function(){
		if(this.get('dimensions') && this.get('dimensions').get('length')>0 && this.get('dimensions').objectAt(1) && this.get('dimensions').objectAt(1).get('isLoaded')){
			return this.get('dimensions').objectAt(1).get('fieldName');
		}
	}.property('chart.dimensions', 'chart.dimensions.@each.isLoaded'),

	depthFormat:function(){
		if(this.get('dimensions') && this.get('dimensions').get('length')>0 && this.get('dimensions').objectAt(1) && this.get('dimensions').objectAt(1).get('isLoaded')){
			return this.get('dimensions').objectAt(1).get('formatAs');
		}
	}.property('chart.dimensions', 'chart.dimensions.@each.isLoaded'),	

	depthDisplay: function(){
		if(this.get('dimensions') && this.get('dimensions').get('length')>0 && this.get('dimensions').objectAt(1)){
			return this.get('dimensions').objectAt(1).get('displayName');
		}
	}.property('chart.dimensions'),

	fact:function(){
		if(this.get('measures') && this.get('measures').get('length')>0){
			return this.get('measures').objectAt(0).get('fieldName');
		}
	}.property('chart.measures'),

	factDisplay:function(){
		if(this.get('measures') && this.get('measures').get('length')>0){
			return this.get('measures').objectAt(0).get('displayName');
		}
	}.property('chart.measures'),

	factUnit:function(){
		if(this.get('measures') && this.get('measures').get('length')>0){
			unit = {};
			unit['prefix'] = this.get('measures').objectAt(0).get('prefix');
			unit['suffix'] = this.get('measures').objectAt(0).get('suffix');
			return unit;
		}
	}.property('chart.measures'),

	factFormat:function(){
		if(this.get('measures') && this.get('measures').get('length')>0){
			return this.get('measures').objectAt(0).get('formatAs');
		}
	}.property('chart.measures'),

	isCalculated:function(){
		if(this.get('measures') && this.get('measures').get('length')>0){
			return this.get('measures').objectAt(0).get('isCalculated');
		}
	}.property('chart.measures'),

	dimensionsSupportedFormats:function(){		
		var dimension=this.get('dimensionName');		
		var dataType=this.get('dataSource').getDataType(dimension);
		if(dataType=="date")
		{
			var arr=['','Month', 'Quarter', 'Year', 'Month Year'];			
			return arr;
		}
		else
		{
			// this.set('dimensionFormatAs','');
			return [];
		}			
	}.property('dimensionName'),

	dimension: function() {
		var obj = this;
		var dataSource = this.get('dataSource');
		var formatDimension = this.get('dimensionFormatAs');
		var dimensionName = this.get('dimensionName');
		if(!dataSource || !dataSource.get('isSetup')) {
			return false;
		}
		return dataSource.getDimension(dimensionName)			
	}.property('dimensionName'),

	depthDimension: function() {
		var obj = this;
		var depth = obj.get('depth');
		var dataSource = this.get('dataSource');
		if(!dataSource || !depth) {
			return [];
		}
		return dataSource.getDimension(depth);
	},

	getFormattedDimensionKey: function(val, formatDimension) {
		if(formatDimension === 'Quarter') { // === is faster than == http://jsperf.com/comparison-of-comparisons
	        var date = new Date(val);
        	if(!date || date == 'Invalid Date') 
        		return "";
	        return date.formatQuarter();
        } else if (formatDimension === 'Month') {
        	var date = new Date(val);
        	if(!date || date == 'Invalid Date') 
        		return "";
        	return date.formatMonth();
        } else if (formatDimension === 'Date String') {
        	var date = new Date(val);
        	if(!date || date == 'Invalid Date') 
        		return "";
        	return date.shortDate();
        } else if (formatDimension === 'Number Group') {
        	var age = parseInt(val);
        	if(!age) {
        		return "";
        	} 
        	var lower_bound = Math.floor(age / 10) * 10;
        	var upper_bound = lower_bound + 10;
			return lower_bound + "-" + upper_bound;
        }
        return "";
	},


	chartData: function(callback, chartObj, filters, limit, offset, sort_key, sort_order) {
		var obj = this,
		chart = this.get('chart');
		var auth_token = Cibi.Auth.get('authToken');
		var chart_type = chart.get('chartType');
		var dimension = obj.get('dimensionName');
		var depth = obj.get('depth');
		var fact =  obj.get('fact');
		var factFormat = obj.get('factFormat');
		var factFormat = (factFormat == 'noopspc' || factFormat == 'opspc') ? 'count' : factFormat;
		var formatAs = obj.get('dimensionFormatAs');
		var url_str = '/charts_data_sources/'+ this.get('id') +'/chartData?auth_token=' + auth_token;
		
		if(this.get('chart').get('preview') == true){
			url_str = url_str + "&preview=true";
			var preview_data = this.get('chart').get('preview_data');
			url_str = url_str + "&chart_type=" + chart_type;
			url_str = url_str + "&preview_data=" + encodeURIComponent(JSON.stringify(preview_data));
			url_str = url_str + "&data_source_id=" + this.get('chart').get('data_source_id');
		}

		if( limit ) {
			url_str = url_str + "&limit=" + limit;
		} 

		if( offset ) {
			url_str = url_str + "&offset=" + offset;
		} 

		if(sort_key) {
			var sort_map = {}
			sort_map[""]
			url_str = url_str + "&sort_key=" + encodeURIComponent(sort_key);	
			if(sort_order) {
				url_str = url_str + "&sort_order=" + sort_order;	
			}
		}

		if(filters && filters.length !== 0) {
			url_str = url_str + "&filters=" + encodeURIComponent(JSON.stringify(filters));
		}		

		var data = null;
		var req = obj.get('data_request');
		if( req ) {
			req.abort();
		}
		console.log(url_str);
	
        req = $.ajax({
            url: url_str,
            type: 'get',
            async: true,
            success: function(result) {
            	if(result['charts_data_sources']){
            		data = result['charts_data_sources'];
            		chartObj.chart.set('forecast', undefined);
            		chartObj.chart.set('forecastModel', undefined);
            		chartObj.chart.set('statsData', undefined);
            	}
            	else{
            		data = result['result'];
            		if(result['forecast']){
	            		chartObj.chart.set('forecast', result['forecast']);
	            		chartObj.chart.set('forecastModel', result['forecastModel']);
	            	}
	            	if(result['statsData']){
	            		chartObj.chart.set('statsData', result['statsData']);
	            	}
	            	if(result['row_totals']){
						chartObj.chart.set('rowTotals', result['row_totals']);
					}
					if(result['column_totals']){
						chartObj.chart.set('columnTotals', result['column_totals']);
					}
					if(result['grand_totals']){
						chartObj.chart.set('grandTotals', result['grand_totals']);
					}
            	}
                chart.set('dbAggregatedData', data);                
                data = obj.formatData(data, dimension, depth, fact, factFormat, formatAs,chart_type);
                chart.set('dimension_unique_values', obj.get_dimension_unique_values(data));
                if(data.length == 0 && !result['page_limit_exceeded']){
                	chart.set('errorMessage','This report returned zero results with current settings');	
                }
                if(result['page_limit_exceeded'] == true){
            		chart.set('pageLimitExceeded', true);
            	}else{
            		chart.set('pageLimitExceeded', undefined);
            	}

                if(depth) {
                	var dsb=chart.get('dashboard');
                	var uniqueValues=obj.get_depth_unique_values(data);
                	chart.set('depth_unique_values', uniqueValues);
                	if(dsb.get('chartsOnClickFilters').length == 0){
                		chart.set('original_zkeys', uniqueValues);
                	}
                }

                if(result['statsData']){
					data=chart.get('highlightRule').highlightData(data, result['statsData']);
				}

                data.cds_id = obj.get("id");
                // obj.set("isSetup", true);
                callback(data, chartObj);
            },
            error: function(request, message, error){
            	var err = " "
            	if(message != 'abort'){
            		err = "Something went wrong! Try refreshing the browser";
            	}	
            	if(request.responseJSON && request.responseJSON.message) {
					err = request.responseJSON.message;
            	}
            	chart.set('errorMessage', err);
            	chart.set('dataLoading', false);
            	// Cibi.Auth.set('globalErrorMessage', true);
            }
        });
        this.set('data_request', req);
        // data = obj.formatData(data);
        
		//this.set("data", data);

		return data;
	},

	get_dimension_unique_values: function(data) {
		if(!data) {
			return [];
		}
		return _.map(data, function(d) {
			return d.key;
		});
	},

	get_depth_unique_values: function(data) {
		if(!data) {
			return [];
		}		
		var depth_keys_arr = _.map(data, function(d) {
			if(d.values) {
				return _.map(d.values, function(a) {
					return a.key;
				})
			};
		});

		if(depth_keys_arr) {
			depth_keys_arr = _.flatten(depth_keys_arr);
		}

		if(depth_keys_arr) {
			depth_keys_arr = _.uniq(depth_keys_arr);
		}
		return depth_keys_arr;
	},

	noFormatData: function(data,fact,factFormat){
		data.forEach(function(dat) {
			var fact_blob = dat[fact];
			dat.val = toFloat(fact_blob[factFormat]);
		});
		
	},


	formatData:function(data, dimension, depth, fact, factFormat, dimensionFormat,chart_type) {
		var dimensions = this.get('dimensions');
		var measures = this.get('measures');
		var hierarchy = [];
		dimensions.forEach(function(d){
			// if(d.get('formatAs')){
			// 	hierarchy.push(d.get('formatAs')+ "(`" +d.get('fieldName')+ "`)") ;
			// }else{
				hierarchy.push(d.get('displayName'));
			// }		  
		});
		/*if(measures.get('length') > 1){
			if(chart_type == 12 || chart_type == 9){
				for(i=0;i<measures.get('length')-1;i++){
					var measure=measures.objectAt(i).get('displayName');
					hierarchy.push(measure);
				}
			}
		}*/
		var nestHierarchy = d3.nest();
		hierarchy.forEach(function(i) {
			nestHierarchy.key(function(d) { 
				return d[i];						
			})
		}); 
		var chart_type = this.get('chart').get('chartType');		
		if(chart_type == "7" || chart_type == "15" || chart_type == '14' || chart_type == '18' || chart_type == '20') {
			return data;
		}

		data = nestHierarchy.entries(data);
				
		if(chart_type == "3" || chart_type == "5" || chart_type == "15") {
			data = data;
		}else if(chart_type == '0') {
			var obj=this;
			measures.forEach(function(m){
				obj.populateSum({"values": data}, m);
			});			
		} else {
			this.getFactVals(data, dimensions, fact, factFormat, measures);
		}
		return data;
	},

	populateSum: function(node, measure) {
		var obj = this;
		var fact_format = measure.get('formatAs') || '';
		var fact = measure.get('fieldName');
		var fact_str=measure.get('displayName');
		// var fact_str = fact_format + "(`" + fact + "`)";
		if(!(node.values instanceof Array)) {
			node[fact_str] = toFloat(node[fact_str]) || 0;
			node.count = 1;
			return node[fact_str]; //parseFloat(node.sum.replace(/,/g, ""));
		} else {
			node[fact_str] = node[fact_str] || 0;
			node.count = 0;
			node.values.forEach(function(n) {
				node[fact_str] += obj.populateSum(n, measure);
				node.count += n.count;
			})
		}
		return node[fact_str];
	},

	getFactVals: function(data,dimensions,fact,factFormat,measures){
			data.forEach(function(dat) {
	      		if(dimensions.objectAt(1)) {
	      			var fact_vals = [];
	      			dat.values.forEach(function(d){
	      				measures.forEach(function(m,i){
	      					if(!fact_vals[i]){
	      						fact_vals[i]=[];	
	      					}	      					
	      					var fact_blob = d.values[0][m.get('displayName')];
	      					d[m.get('displayName')]=toFloat(fact_blob);
	      					fact_vals[i].push(toFloat(fact_blob));
	      					// d[m.get('formatAs')+"(`"+m.get('fieldName')+"`)"]=toFloat(fact_blob[m.get('formatAs')]);
	      					// fact_vals[i].push(toFloat(fact_blob[m.get('formatAs')]));
	      				});
	      				// d.val = toFloat(fact_blob[factFormat]);
		      			// for (var k in fact_blob) {
		      			// 	d[k] = fact_blob[k];
		      			// }
	      				// fact_vals.push(d.val);
	      			});
	      			// TODO: Handle other functions here!
	      			fact_vals.forEach(function(fv,i){
	      				m=measures.objectAt(i);
	      				dat[m.get('displayName')]=d3.sum(fv);
	      				// dat[m.get('formatAs')+"(`"+m.get('fieldName')+"`)"]=d3.sum(fv);
	      			});
	      			// dat.val = d3.sum(fact_vals);
	      		} else {
	      				measures.forEach(function(m){
			      			var fact_blob = dat.values[0][m.get('displayName')];
			      			dat[m.get('displayName')]=toFloat(fact_blob);
			      			// dat.val = toFloat(fact_blob);				  			
			  				// dat[m.get('formatAs')+"(`"+m.get('fieldName')+"`)"]=toFloat(fact_blob[m.get('formatAs')]);
						});
				}
	      	});
	},

	stackData: function(data, zKeys) {
		var obj = this;
		var val = obj.get('measures').objectAt(0).get('displayName');
		var chartData = data;

        var stacked_data = zKeys.map(function(key) {
          return chartData.map(function(d) {
            if(!d.key) {
              return {x: "", y:0};
            }
            var value = d.values.filter(function(v) {
              return v.key == key;
            });
            
            if(value.length > 0) {
            	var jsonObject={};
            	jsonObject["x"]=d.key;
            	jsonObject["key"]=d.key; 
              	jsonObject["val"]= +value[0][val];
              	jsonObject[val] = +value[0][val];
              	jsonObject["y"]=+value[0][val];
              	jsonObject["zkey"]= key;
              	jsonObject["sem"]= value[0].sem;
              return jsonObject;
            }
            return {x: "", y:0};
          });
        });
       	stacked_data = _.flatten(stacked_data);

        return stacked_data;
	},

	getFactValue: function(v, tokens) {
		obj = this;
		var fact = obj.get('fact');

		if(tokens && tokens.length > 0) {
			var fact_str = fact;
			var invalid_vals = false;
			tokens.forEach(function(t) {
				var tok = t.replace(/[\[\]]/g,"");
				var val = v[tok];
				if(val) {
					if(val.trim() == '-') {
						fact_str = '-';
					} else if (jStat.utils.isNumber(toFloat(val))) {
						fact_str = fact_str.replace(t, val);		
					}
				} else {
					invalid_vals = true;
				}
			});
			if(invalid_vals) {
				return 0;
			} 
			if(fact_str == '-') {
				return fact_str;
			}
			return eval(fact_str);
		} else {
			if(v[fact] && v[fact].trim() === '-') {
				return '-';
			}									
			var val = toFloat(v[fact]);	
			if(isNaN(val)) {
				return 1;
			}
			return val;
		}		
	},

	getDimensionData: function(count) {
		var obj = this;
		var dimension = obj.get('dimension');
		if(!dimension) {
			return [];
		}
		var data = dimension.top(count);
		var chart = obj.get('chart');
		var filters =  chart.get('filteredChartFilters');
		filters.forEach(function(filter) {
			data = filter.apply(data);
		});
		return data;
	},

	rawData: function(filters, limit, offset, fields, is_underlying_data, option_value) {
		var obj = this;
		var auth_token = Cibi.Auth.get('authToken');
		var chart_type = this.get('chart').get('chartType');
		var url_str = '/charts_data_sources/'+ this.get('id') +'/rawData?auth_token=' + auth_token;
		
		if( limit ) {
			url_str = url_str + "&limit=" + limit;
		} 

		if( offset ) {
			url_str = url_str + "&offset=" + offset;
		} 

		if(filters && filters.length !== 0) {
			url_str = url_str + "&filters=" + encodeURIComponent(JSON.stringify(filters));
		}

		if(fields && fields.length !==0){
			url_str=url_str + "&fields=" + encodeURIComponent(JSON.stringify(fields.split(",")));
		}

		if(is_underlying_data){
			url_str=url_str + "&is_underlying_data=" + is_underlying_data;
		}

		if(option_value){
			url_str=url_str + "&option_value=" + option_value;
		}

		console.log(url_str);

		var data = null;
		var req = obj.get('data_request');
		if( req ) {
			req.abort();
		}

        req = $.ajax({
            url: url_str,
            type: 'get',
            async: false,
            success: function(result) {
                data = result['charts_data_sources'][0];
                //data = obj.formatData(data, dimension, depth, fact);
                // obj.set("isSetup", true);
                //callback(data, chartObj);
            }
        });
        this.set('data_request', req);
        // data = obj.formatData(data);
        
		//this.set("data", data);
		return data;
	},

	getHierarchialData: function(cData) {
		var obj = this;
		var chart = this.get('chart');
		var chart_type = this.get('chart').get('chartType');
		var dimension = this.get('dimension');
		var fact_format = this.get('factFormat') || '';
		var fact = this.get('fact')
		var fact_str = fact_format + "(`" + fact + "`)";
		var count = this.get('count') || 'Infinity';
		var hierarchy = (chart.get('configs')) ? JSON.parse(chart.get('configs')).hierarchy : "";
		if(chart_type == 14){
			if(chart.get('configs')){
				var configObj=JSON.parse(chart.get('configs'));
				hierarchy = hierarchy.concat(configObj.column_fields);
				var measure=configObj.measure_fields[0];
				if(measure){
					if(measure["format"]=="Count,Distinct"){
						fact_str="Count(Distinct(`"+measure["field"]+"`))";
					}
					else{
						fact_str=measure["format"] + "(`"+measure["field"]+"`)";	
					}					
				}
			}			
		}
		var new_hierarchy = [];
		$.each(hierarchy, function(i,h){
			if(h.toLowerCase().indexOf("year") >= 0 || h.toLowerCase().indexOf("month") >= 0){
				new_hierarchy.push(h.replace('(', '(`').replace(')', '`)'));
			} else {
				new_hierarchy.push(h);
			}
		})
		hierarchy = new_hierarchy;

		var dimensionData = cData || dimension.top(count);
		var sort_by_key = chart.get('configObj')["sort_by_key"];

		var nestHierarchy = d3.nest();
		hierarchy.forEach(function(i) {
			nestHierarchy.key(function(d) { 
				if(d[i]) {
					return d[i];	
				}
			})	
			if(sort_by_key) {
				nestHierarchy.sortKeys(d3.ascending);
			}
			
		}); 

		
		data = nestHierarchy.entries(dimensionData);
		function populateSum(node) {
			if(!(node.values instanceof Array)) {
				node.val = toFloat(node[fact_str]) || 0;
				node.count = 1;
				return node.val; //parseFloat(node.sum.replace(/,/g, ""));
			} else {
				node.val = node.val || 0;
				node.count = 0;
				node.values.forEach(function(n) {
					node.val += populateSum(n);
					node.count += n.count;
				})
			}
			return node.val;
		}
		if(chart_type == '0' || chart_type == '14') {
			populateSum({"values": data});	
		} else if (chart_type == '1') {
			if(obj.fact) {
				nestHierarchy.rollup(function(leaves) { 
					return d3.sum(leaves, function(d) {
						return parseFloat(d[fact_str].replace(/,/g, ""));
					}); 
				});
			}
		}
		
		return data;
	},

	getGeoData: function() {
		var depth = this.get('depth');
		var dataSource = this.get('dataSource');
		var dimension = this.get('dimension');
		var fact_format = this.get('factFormat');
		if( dataSource && dataSource.get('isSetup') && dimension ) {
			var fact = this.get('fact');
			var count = this.get('count');
			
			var city_dimension = depth || this.get('dimensionName');
			var group = dimension.group().reduce(
				function(p, v) {
					// TODO : If LAT LON is not available, query some DB & figure out the lat long (Google API, Local?)
					var city_record = p.cities[v[city_dimension]] || {};
					city_record.sum = city_record.sum ? city_record.sum + toFloat(v[fact]) : toFloat(v[fact]);
					city_record.count = city_record.count ? city_record.count + 1 : 1;
					city_record.avg = city_record.sum / city_record.count;
					city_record.val = city_record[fact_format];
					if(v.LAT) {
						city_record.lat = v.LAT;
					} 
					if(v.LON) {
						city_record.lon = v.LON;
					}
					p.cities[v[city_dimension]] = city_record;
					p.sum = p.sum ? p.sum + toFloat(v[fact]) : toFloat(v[fact]);
					p.count += 1;
					p.avg = p.sum / p.count;
					p.val = p[fact_format];
					return p;
				},
				function(p, v) {
					// TODO : If LAT LON is not available, query some DB & figure out the lat long (Google API, Local?)
					var city_record = p.cities[v[city_dimension]] || {};
					city_record.sum = city_record.sum ? city_record.sum - toFloat(v[fact]) : toFloat(v[fact]);
					city_record.count = city_record.count ? city_record.count - 1 : 1;
					city_record.avg = city_record.sum / city_record.count;
					city_record.val = city_record[fact_format];
					if(v.LAT) {
						city_record.lat = v.LAT;
					} 
					if(v.LON) {
						city_record.lon = v.LON;
					}
					p.cities[v[city_dimension]] = city_record;
					p.sum = p.sum ? p.sum - toFloat(v[fact]) : toFloat(v[fact]);
					p.count -= 1;
					p.avg = p.count == 0 ? 0 : p.sum / p.count;
					p.val = p[fact_format];
					return p;
				},
				function() {
					return {
						cities: {},
						sum: 0,
						avg: 0,
						count: 0,
						val: 0
					}
				}
				);
			
			return group.all();
		}
		return [];		
	},

	filter: function(key, dim) {
		var dimensionName = this.get('dimensionName');
		var depth = this.get('depth');
		var dimension = false;
		if( dim == dimensionName ) {
			dimension = this.get('dimension');
		} else if (dim == depth) {
			this.set('filtered_depth', true);
			dimension = this.get('dataSource').getDimension(depth);
		}

		if(dimension) {
			this.set('currentFilter', key);
			key = key.trim();
			dimension.filter(key);
		}
	},

	reset: function() {
		var dimension = this.get('dimension');
		if(this.get('filtered_depth')) {
			dimension = this.get('dataSource').getDimension(this.get('depth'));
		}
		
		if(dimension) {
			this.set('currentFilter', null);
			dimension.filter(null);
		}
	},

	sDim: function() {
		return this.get('sDim');
	}.property(''),

	factDisplayStr: function() {
		var fact_format = this.get('factFormat');
		var fact = this.get('fact');
		switch(fact_format) {
			case 'sem':
				return 'SEM (' + fact + ')';
			case 'avg':
				return 'MEAN (' + fact + ')';
			case 'sum':
				return 'SUM (' + fact + ')';
			case 'count':
				return 'COUNT (' + fact + ')';
			default:
				return fact;
		}
	},

	getUniqueKeys: function(field, formatAs, callback, obj) {
		if(!obj) {
			obj = this;
		}
		if(obj.get('dataSource')){
			data_source = obj.get('dataSource');
		}else{
			if(obj.get('chart')){
				if(obj.get('chart').get('dataSources')){
					data_source = obj.get('chart').get('dataSources').objectAt(0);
				}
			}else{
				data_source = undefined;
			}
		}
		if(data_source != undefined){
			return data_source.getUniqueKeys(field, formatAs, callback, obj);
		}
	},

})
