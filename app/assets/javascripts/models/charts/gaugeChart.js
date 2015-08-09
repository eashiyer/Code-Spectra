Cibi.GaugeChart = Ember.Object.extend({
  	draw: function() {
    	var obj = this;
    	var filters = obj.chart.getFilters();
   		var cds = obj.chart.get('chartsDataSources').objectAt(0);
   		obj.chart.set("dataLoading", true);
   		var data = cds.chartData(obj._drawChart, obj, filters);
  	},

  	_drawChart: function(data,obj){
        var val = obj.chart.get('measures').get('lastObject').get('displayName');
        var chart = obj.get('chart');
        chart.clearChart();
        chart.setDateFormats();
        var dsb = chart.get('dashboard');
		
    		var margin =  {
    		  top: 0, 
    		  right: 0, 
    		  bottom: 0,  
    		  left: 0, 
    		};

        var width  = obj.chart.get('width')  - margin.left - margin.right;
        var height = obj.chart.get('height') - margin.top - margin.bottom;

        var center = {
            y: ( height - margin.top - margin.bottom ) / 2,
            x: ( width - margin.left - margin.right ) / 2
        };
        var diameter;
        // if(height < width){
        //   if(height > 100){
        //     diameter = height - ((height/100) * 5);
        //   }else{
        //     diameter = 100;
        //   }
        // }else{
        //   diameter = width - ((width/100) * 20);
        // }

        diameter = height < width ? height * 0.8 : width * 0.8;
        
        var value = data[0][val];
        radialProgress("#"+obj.chart.get('elemId'))
            .height(height)
            .width(width)
            .margin(margin)
            .diameter(diameter)
            .value(value)
            .render();
    	obj.chart.set("dataLoading", false);
    }
});