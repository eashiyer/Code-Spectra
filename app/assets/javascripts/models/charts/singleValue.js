/**
@module charts
@class Cibi.BarChart
*/

/**
  `Cibi.BarChart` is an Ember Object class representing a bar chart.

  It contains methods specific to bar chart.

  @class Cibi.BarChart
  @module charts
*/



Cibi.SingleValueChart = Ember.Object.extend({

  /**
    `init()` is called automatically when an instance of this class is created with

        Cibi.BarChart.create

    @method init
  */
    init: function() {

    },

    draw: function() {
        var obj = this;
        var filters = obj.chart.getFilters();
        var cds = obj.chart.get('chartsDataSources').objectAt(0);
        obj.chart.set('dataLoading', true);
        var data = cds.chartData(obj._drawSingleValueChart, obj, filters);
    },
    
    _drawSingleValueChart: function(data, obj) {
      
      $("#" + obj.element).html("");
      var cds = obj.chart.get('chartsDataSources').objectAt(0);
      var chart = obj.get('chart');
      var measures= obj.chart.get('measures');
      chart.clearChart();
      var dimension = cds.get('dimensionName');
      var dimensionFormat=cds.get('dimensionFormatAs');
      var dimensionDataType = cds.get('dataSource').getDataType(dimension);
      var formatDate=chart.get('formatDate');
      var parseDate = chart.get('parseDate');
      var center={
          x:chart.get('width')/2,
          y:chart.get('height')/2
      }
      
      if(!dimension){  
        var val = obj.chart.get('measures').get('lastObject').get('displayName');

        if(data.length > 0){
          if(cds.get('factFormat') == 'count' || cds.get('factFormat') == 'count,distinct'){
            var value = obj.displayUnit ? formatValue(data[0][val], obj.displayUnit, ".3f") : d3.format(",")(data[0][val]);
          }else{
            var value = obj.displayUnit ? formatValue(data[0][val], obj.displayUnit, ".3f") : d3.format(",.2f")(data[0][val]);
          }
          // factType = cds.get('factType'),
          factUnit=  cds.get('factUnit');
          if(isNaN(data[0][cds.get('factDisplay')])) {
            value = data[0][cds.get('factDisplay')]; 
          } else {
            if(obj.displayUnit == "No Units (Indian)") {
              value = CommaFormatted(data[0][cds.get('factDisplay')], "Indian");
            } else if(obj.displayUnit == "No Units (American)") {
              value = d3.format(",.2f")(data[0][cds.get('factDisplay')])
            }        
          }
        }else{
          var value = '0.00'
        }




        if(factUnit){ 
            if(factUnit['prefix'] == "USD") {
              value = " $ " + value;
            } else if(factUnit['prefix'] == "Rs") {
              value = " ₹ "  + value;
            } else if(factUnit['prefix'] == "Euro"){
              value = "€" + value;
            }
            if(factUnit['suffix'] == "%") {
              value = value + "  " + factUnit['suffix'] + " ";
            } 
        }

        var fontSize = obj.chart.get('width');
        fontSize=(parseInt((1/8)*fontSize) > 40) ? 40 : parseInt((1/8)*fontSize);

        var svg   = obj.chart.getSvgElement(0, 0);      
        svg.append("text")                                                                
            .text(value)
            .attr("x", center.x)
            .attr("y", center.y )
            .attr("text-anchor", "middle")
            .attr("font-size", (fontSize+"px"))
            .attr("font-family", "Roboto-Medium")
            .attr("fill", "black");
        }else if(dimensionDataType == "date"){

          
          var x=chart.get('width');
          var y=chart.get('height');
          var val = obj.chart.get('measures').get('lastObject').get('displayName');
          var crvalue,pastvalue,crvalue1,pastvalue1   ;
          
          if(data.length > 0 && data.length > 1){
            crvalue=data[0][val];
            pastvalue=data[1][val];
            if(cds.get('factFormat') == 'count' || cds.get('factFormat') == 'count,distinct'){
              crvalue1 = obj.displayUnit ? formatValue(data[0][val], obj.displayUnit, ".3f") : d3.format(",")(data[0][val]);
            }else{
              crvalue1 = obj.displayUnit ? formatValue(data[0][val], obj.displayUnit, ".3f") : d3.format(",.2f")(data[0][val]);
            }
            factUnit =  cds.get('factUnit');
            
            if(isNaN(data[0][cds.get('factDisplay')])){
              crvalue1 = data[0][cds.get('factDisplay')]; 
            } else {
              if(obj.displayUnit == "No Units (Indian)"){
                crvalue1= CommaFormatted(data[0][cds.get('factDisplay')], "Indian");
              } else if(obj.displayUnit == "No Units (American)"){
                crvalue1 = d3.format(",.2f")(data[0][cds.get('factDisplay')]);
              }        
            }
          }else if(data.length == 1 ){
            crvalue=data[0][val];
            crvalue1 = obj.displayUnit ? formatValue(data[0][val], obj.displayUnit, ".3f") : d3.format(",.2f")(data[0][val]),
            // factType = cds.get('factType');
            factUnit =  cds.get('factUnit');
            
            if(isNaN(data[0][cds.get('factDisplay')])){
              crvalue1 = data[0][cds.get('factDisplay')]; 
            } else {
              if(obj.displayUnit == "No Units (Indian)"){
                crvalue1= CommaFormatted(data[0][cds.get('factDisplay')], "Indian");
              } else if(obj.displayUnit == "No Units (American)"){
                crvalue1 = d3.format(",.2f")(data[0][cds.get('factDisplay')]);
              }        
            } 
          }else{
            var value = '0.00'
          }
          
          if(factUnit){ 
            if(factUnit['prefix'] == "USD") {
              crvalue1 = "$" + crvalue1;
            } else if(factUnit['prefix'] == "Rs") {
              crvalue1 = "₹"  + crvalue1;
            } else if(factUnit['prefix'] == "Euro"){
              crvalue1 = "€" + crvalue1;
            }

            if(factUnit['suffix']) {
              crvalue1 = crvalue1 + " " + factUnit["suffix"] + " ";
            } 
          }
          if(pastvalue){
            var change = crvalue - pastvalue;
            if(cds.get('factFormat') == 'count' || cds.get('factFormat') == 'count,distinct'){
              var change1 = change;
              change1=obj.displayUnit ? formatValue(change1, obj.displayUnit, ".3f"):d3.format(",")(change1);
            }else{
              var change1 = d3.format(".2f")(change);
              change1=obj.displayUnit ? formatValue(change1, obj.displayUnit, ".3f"):d3.format(",.2f")(change1);
            }
            
            
            var percent_change = (change/pastvalue)*100;
            percent_change = d3.format(",.2f")(percent_change);
            percent_change = percent_change + "%";
 
            if(obj.displayUnit == "No Units (Indian)"){
              change1= CommaFormatted(change, "Indian");
            } else if(obj.displayUnit == "No Units (American)"){
              change1 = d3.format(",.2f")(change);  
            } else {
              var value = '0.00'
            }
            if(change > 0){
                change1 = "+"+change1;
                percent_change = "+" + percent_change;
            }
          }else{
            var change1 ="-";
            var percent_change ="-";
          }
          
          var changeFrom;
            if(dimensionFormat == "Month"){
                  changeFrom = "MoM";
            }else if(dimensionFormat == "Month Year"){
                  changeFrom = "MoM";
            }else if(dimensionFormat == "Quarter"){
                  changeFrom = "QoQ";
            }else if(dimensionFormat == "Year"){
                  changeFrom = "YoY";
            }else if(dimensionFormat == "Week"){
                  changeFrom = "WoW";
            }else if(dimensionFormat == "Day"){
                  changeFrom = "DoD";
            };

          var change_value = change1 + "   " + percent_change + "   " + changeFrom;

          var fontSize = obj.chart.get('width');
          fontSize = (parseInt((1/8)*fontSize) > 50) ? 50 : parseInt((1/8)*fontSize);
          fontSize = (crvalue1.length > 13) ? (fontSize - 8) : fontSize;
          var textSize = 13;

          var svg   = obj.chart.getSvgElement(0,0);      
          svg.append("text")                                                                
            .text(crvalue1)
            .attr("x",center.x)
            .attr("y", center.y)
            .attr("text-anchor", "middle")
            .attr("font-size", fontSize+"px")
            .attr("font-family", "Roboto-Medium")
            .attr("fill", "black")
          
          svg.append("text")                                                                
            .text(change_value)
            .attr("x",center.x)
            .attr("y",center.y + center.y/2)
            .attr("text-anchor", "middle")
            .attr("xml:space","preserve")
            .attr("font-size", textSize+"px")
            .attr("font-family", "Roboto-Medium")
            .attr("fill",function(d){
                  if(change<0){
                     return "red";
                  }else{
                     return "green";
                  }
            });
            
        }else{
          // return "Single Value Charts are only work with Time Format dimension";
        }
      obj.chart.set('dataLoading', false);
      obj.chart.get('dashboard').highlightFilters();
  }


});