Cibi.Forecast = Ember.Object.create({
    draw: function(chartObj, svg, xAxis, yAxis){
        var obj=chartObj;
        var forecast=obj.forecast;
        var lines= [
            { "line":"mean" , "color":"green" }, 
            { "line":"lower" , "color":"red" }, 
            { "line":"upper" , "color":"blue" }
        ];

        lines.forEach(function(l){
            var line=d3.svg.line()
                .x(function(d) { 
                    return xAxis(obj.parseDate(d.key));
                })
                .y(function(d) { 
                    return yAxis(d[l.line]);
                })
                .interpolate("cardinal");

            svg.append("svg:path")
                .attr("d", line(forecast))
                .attr("clip-path", obj.getClipPathUrl())
                .style("fill", "none")
                .style("stroke", l.color);
        });
    }
});
