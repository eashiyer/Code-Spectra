/**
@module charts
@class Cibi.GeoMap
*/

/**
  `Cibi.GeoMap` is an Ember Object class for creating combination charts.

  @class Cibi.GeoMap
  @module charts
*/
Cibi.GeoMap = Ember.Object.extend({

    init: function() {
        if(!this.element) {
            throw new Error("Need to specify element id");
        }

        // if(!this.dimensionName) {
        //     throw new Error("Need to specify dimension");
        // }

        this.set("currentFilterKey", null);
    },

   /**
      This method draws a geomap within the html element specified in configObj.

      @method draw
    */
    draw: function() {
        var obj = this;
        var charts_data_sources = obj.chart.get('chartsDataSources');
        var cds = charts_data_sources.objectAt(0);
        var filters = obj.chart.getFilters();
        obj.set('cds_properties', cds.getProperties(["depth", "fact", "dimensionName", "dimensionFormatAs", "factFormat"]));
        obj.chart.set('dataLoading', true);
        var data = cds.chartData(obj._drawGeoChart, obj, filters);
        obj.chart.set("isSetup", false);
        
          d3.tsv('/data/country-names.tsv', function(data) {
            obj.set('country_names', data);
            country_names = data;
          })
    },

    _drawGeoChart: function(data, self){
      var obj = self;
      
      obj.chart.clearChart();
      //var geodat = obj.cds.objectAt(0).getGeoData();
      obj.set("data", data); 

      var width = obj.chart.get('width');
          height = obj.chart.get('height');

      // var data = obj.get('data');
      var cds = obj.cds.objectAt(0);
      var val = cds.get('factDisplay');

      var places = data.map(function(d) {  
        var cities = d.values; //.cities;
        var ret = [];
        for(var i = 0; i < cities.length; i++) {
          var city = cities[i];
          var value = {};
          value.val = city[val];
          value.lat = (obj.cds.objectAt(0).get('depth')) ? city.values[0].LAT :toFloat(city.LAT);
          value.lon = (obj.cds.objectAt(0).get('depth')) ? city.values[0].LON :toFloat(city.LON);
          ret.push({key: city.key ? city.key : city[obj.get('dimensionName')], value: value});
        }
        return ret;
      });
      places = _.flatten(places);
      places = _.filter(places, function(d) {
        return d.key && d.value.lat && d.value.lon;
      });

      var max = d3.max(places, function(d) {
            return d.value.val;
      });

      obj.set('places', places);

      var projection = d3.geo.mercator()
          .center([-5, 40 ])
          .scale(125)
          ;
      var svg = d3.select("#" + obj.element).append("svg")
          .attr("width", width)
          .attr("height", height);

      var path = d3.geo.path()
          .projection(projection);

      var g = svg.append("g");
      
      var topology_file = "/data/world-110m2.json";
      
      // load and display the World
      d3.json(topology_file, function(error, topology) {
          obj.drawWorld(g, projection, path, topology);        
      });        

      var zoom = d3.behavior.zoom()
        .on("zoom",function() {
            g.attr("transform","translate("+
                d3.event.translate.join(",")+")scale("+d3.event.scale+")");
            g.selectAll("circle")
                .attr("d", path.projection(projection))
                .attr('r', function(d) { 
                  var factor = 0.75 * d3.event.scale
                  var radius = parseInt(d.value.val * 4 / ( max * factor));
                  radius = radius > 4 ? 4 : radius;
                  radius = radius < 1 ? 1 : radius;
                  return radius;
                })
            g.selectAll("path")
                .attr("d", path.projection(projection));

        });

      svg.call(zoom);
      obj.chart.set('dataLoading', false);
      obj.chart.get('dashboard').highlightFilters();
    },

   /**
      This method draws a map of India

      @method drawWorld
    */
    drawWorld: function(g, projection, path, topology) {
      var obj = this;
      var country_names = obj.get('country_names');

      var color_scale = ['#9ECAE1', '#6BAED6', '#4292C6', '#2171B5', '#084594'];


      var countries = g.append("g")
                       .attr('id', 'countries');

      var cities = g.append("g")
                    .attr('id', 'cities');
      obj.drawShapes(countries, topojson.object(topology, topology.objects.countries).geometries, path);

      obj.drawPlaces(cities, projection);      
    },

   /**
      This method draws the shapes according to the topojson geometries passed to it 

      @method drawShapes
      @param {Object} g
      @param {Object} shapesData
      @param {Object} path
    */
    drawShapes: function(g, shapesData, path) {
      var obj = this;
      var data = obj.get('data');
      var cds = obj.cds.objectAt(0);
      var val = cds.get('factDisplay');
      var max = d3.max(data, function(d) {
        return d[val];
      });
      var min = d3.min(data, function(d) {
        return d[val];
      });
      var mean = d3.mean(data, function(d) {
        return d[val];
      });
      obj.chart.setDateFormats();

      // var color_pallette = ['#9ECAE1', '#6BAED6', '#4292C6', '#2171B5', '#084594'];
      var color_pallette = ['#9ECAE1', '#4292C6', '#084594'];
      var colorScale = d3.scale.linear()
           .domain([min, mean, max])
           .range(color_pallette);
      
      var tip = obj.chart.getChartTip();

      g.selectAll("path")
        .data(shapesData)
        .enter()
        .append("path") 
        .style("fill", function(d) {
          var shape = obj.lookupShape(d);
          if(shape[0]) {
            return colorScale(shape[0][val]);
          } 
          return "#666666"; 
        })
        .style("stroke", "#CCCCCC")
        .style('stroke-width', '0.1px')
        .attr("id", function(d) {
          return 'chart-' + obj.chart.get('id') + '-object-' + d.id;
        })
        .attr("d", path)
        .on("mouseover", function(d) {
          if(!obj.chart.get('notToHideTip')){
            var shape = obj.lookupShape(d);
            if(shape[0]) {
              var  ret =  obj.getShapeName(d);
              var key = ret.long_name;
              var value = shape[0][val];

              var data={};
              data.key=key;
              data.value=value;

              var otherData={};
              tip.offset([-10,0]);
              obj.chart.getChartElementData(data,otherData,tip,g);
              tip.show();
            }
          }
        })
        .on("mouseout",function(){
          if(!obj.chart.get('notToHideTip')){
            tip.hide();
          }
        })
        .on("click", function(d) {
          var shape = obj.lookupShape(d);
          if(shape[0]) {
            var cds = obj.cds.objectAt(0), 
            dimensionName = cds.get('dimensionName');
            formatAs = cds.get('dimensionFormatAs'),
            // ret =  obj.getShapeName(d),
            key = shape[0].key,
            value = shape[0][val];            

            var filter = {};
            filter.dimension = dimensionName;
            filter.formatAs = formatAs ? formatAs : "";
            filter.value = key;

            var  ret =  obj.getShapeName(d);
            var key2 = ret.long_name;
            var value2 = shape[0][val];

            var data={};
            data.key=key2;
            data.value=value2;

            var otherData={};

            obj.chart.chartElementOnClick(this.id, filter, data, otherData, tip, g);

            tip.offset([-10,0]);
          }
        });

        var legend_range_array = [], 
        f_min = d3.format(",.2f")(min), 
        f_mean = d3.format(",.2f")(mean), 
        f_max = d3.format(",.2f")(max);

        legend_range_array.push(f_min + " - " + f_mean);
        legend_range_array.push(f_mean + " - " + f_max);
        legend_range_array.push(">= " + f_max);        
        obj.chart.drawChartLegend([min, mean, max], colorScale, false, legend_range_array);
    },

   /**
      This method returns an object with shape's long and short name, which is essentially the countries name.

      @method getShapeName
      @param {Object} shapeData
    */
    getShapeName: function(d) {
      var obj = this;
        var country_names = obj.get('country_names');
        var country = _.filter(country_names, function(c) {
          return c.NUM == d.id;
        });
        var long_name = country[0] ? country[0].Country.trim().toLowerCase() : "";
        var short_name = country[0] ? country[0].ISO2 ? country[0].ISO2.trim().toLowerCase() : "" : "";
      return {long_name: long_name, short_name: short_name};
    },

   /**
      This method returns an object with shape data.

      @method loopupShape
      @param {Object} shapeData
    */
    lookupShape: function(d) {
      var obj = this;
      var data = obj.get('data');

      // Figure out if shape dimension is available & color accordingly
      var ret = obj.getShapeName(d);
      var long_name = ret.long_name;
      var short_name = ret.short_name;
      var shape = _.filter(data, function(s) {
        return ( long_name === s.key.toLowerCase().trim() || ( short_name && short_name === s.key.toLowerCase().trim() ));
      }) 
      return shape;     
    },

   /**
      This method marks places on the map using a cirle.

      @method drawPlaces
      @param {Object} shapeData
      @param {Object} projection
    */
    drawPlaces: function(g, projection) {
      var obj = this;
      var data = obj.get('data');
      var rawData = []; //obj.cds.objectAt(0).rawData();
      var cds = obj.cds.objectAt(0);
      var val = cds.get('factDisplay');
      var places = obj.get('places');
      var max = d3.max(places, function(d) {
        return d.value.val;
      });
      obj.chart.setDateFormats();

      var tip = obj.chart.getChartTip();

      g.selectAll("circle")
        .data(places)
        .enter()
        .append("circle")
        .attr('id', function(d) {
          var chart_id =  obj.chart.get('id');
          return 'chart-' + chart_id + '-place-' + pruneStr(d.key);
        })
        .attr("cx", function(d) {
            if(d.value.lon && d.value.lat) {
              return projection([d.value.lon, d.value.lat])[0]; 
            }
         })
        .attr("cy", function(d) {
          if(d.value.lon && d.value.lat) {
            return projection([d.value.lon, d.value.lat])[1];
          }
        })
        .attr("r", function(d) { 
          var radius = parseInt(d.value.val * 4 / max);
          radius = radius > 4 ? 4 : radius;
          radius = radius < 2 ? 2 : radius;
          return radius;
        })
        .style("fill", function(d) {
          return obj.chart.yellow();
        })
        .style("stroke", function(d) {
          return "red" ;
        })
        .style('stroke-width', '0.5px')
        .style("cursor", "pointer")
        .on('click', function(d) {
          var chart_id =  obj.chart.get('id');
          var curr_filter = obj.chart.get('filterKey');
          if(curr_filter) {
            $("#" + curr_filter).css('fill', obj.chart.yellow());
          }
          this.style.fill = obj.chart.red();
          var depth = cds.get('depth'), formatAs = cds.get('dimensionFormatAs');

          var filterObj=[];

          var filter1 = {};
          filter1.dimension = obj.dimensionName;
          filter1.formatAs = formatAs ? formatAs : "";
          filter1.value = d.key;
          filterObj.push(filter1);
          
          var filter2={};
          filter2.dimension = depth;
          filter2.formatAs = "";
          filter2.value = d.zkey;

          filterObj.push(filter2);

          var  key =  d['key'];
          var value = d.value.val;
          
          var data={};
          data.key=key;
          data.value=value;

          var otherData={};
          
          obj.chart.chartElementOnClick(this.id, filterObj, data, otherData, tip, g);

          tip.offset([-10,0]);

          // depth = depth || obj.dimensionName;
          // var filter = {};
          // filter.dimension = depth || obj.dimensionName;
          // filter.formatAs = filter.dimension == obj.dimensionName ? formatAs : "";
          // filter.value = d.key;
          // obj.chart.chartElementOnClick(obj.id, filter);
        })
        .on("mouseover", function(d) {
          if(!obj.chart.get('notToHideTip')){
            var  key =  d['key'];
            var value = d.value.val;
            
            var data={};
            data.key=key;
            data.value=value;

            var otherData={};
            tip.offset([-10,0]);
            obj.chart.getChartElementData(data,otherData,tip,g);
            tip.show();
          }
        })
        .on("mouseout",function(){
          if(!obj.chart.get('notToHideTip')){
            tip.hide();
          }
        });
    }
});
