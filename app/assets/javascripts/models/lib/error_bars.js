Cibi.ErrorBars = Ember.Object.create({
    draw: function(chartObj, data, statsData, svg, xAxis, yAxis){
        var obj=chartObj;
        var cds = obj.get('chartsDataSources').objectAt(0);
        var val=cds.get('factDisplay');
        var parseDate=obj.get('parseDate');
        _.each(data,function(d, i){
            if(d.key==statsData[i].key){
              _.each(statsData[i], function(value, key){
                d[key]=value;
              });
            }
        });
        errorBarColor=obj.errorBar();
        var eb = this.errorBar(errorBarColor)
            .oldXScale(xAxis)
            .xScale(xAxis)
            .oldYScale(yAxis)
            .yScale(yAxis)
            .yValue(function(d){
                if(d[val]) {
                    return yAxis(d[val]);
                }
                return yAxis(0);
                })
            .xValue(function(d){
                  return xAxis(d.key)+((obj.get('scale_type')=="ordinal")? xAxis.rangeBand()/2 : 0);
            })
            .xError(function(d){
                return null;
            })
            .yError(function(d){
                return d.sem;
            });

        var plot = svg.append("g");

        var plotErrorbar = plot.selectAll("g")
                            .data(data)
                            .enter()
                            .append("g")
                            .attr("transform", function(d) {
                                var x = xAxis(d.key)+xAxis.rangeBand()/2;
                                var y = yAxis(d[val]);
                                return "translate("+ x +","+ y +")"
                            })
                            .call(eb);
    },

    errorBar: function(errorBarColor){
        var obj=this;
        //TODO
        //- Think of an additional way to represent error bars, maybe just the orthognal case (i.e. use width not height)
        //- Does ordinal scale even make sense here?  May need to remove.
        var size = 5,
        xError = function(d) {
            return obj.exists(d[0].s);
        }, 
        yError = function(d) {
            return obj.exists(d[1].s);
        },
        errormarker = null, //points will inherit from g.dataset   
        xValue = function(d) {
            return (d[0].x === undefined) ? d[0] : d[0].x;
        }, 
        yValue = function(d) {
            return (d[1].x === undefined) ? d[1] : d[1].x;
        },
        oldXScale, //probably can give these smarter defaults
        oldYScale,
        xScale,
        yScale;
            
        function marks(datapoints){        
            datapoints.each(function(d,i) {            
                var g = d3.select(this),            
                //Use color/errormarker defined.
                errormarker = errormarker || obj.exists(g.datum().errormarker);
                                        
                //Error
                var err = g.selectAll(".err")
                    .data(function(d){
                        return (!(xError(d) === null) || !(yError(d) === null)) ? [d] : []
                    }, xValue),
                errEnter,
                errExit,
                errUpdate;                            

                switch (errormarker) {                               
                case null: {
                    errEnter = err
                                .enter()
                                .append("path")
                                .attr("class","err")
                                .style("fill", "none")
                                .style("shape-rendering", "crispEdges")
                                .style("stroke-width", "1px")
                                .style("stroke", errorBarColor)
                                // .style("stroke-dasharray", "3,3"),
                    errExit = d3.transition(err.exit()).remove(), 
                    errUpdate = d3.transition(err),
                    errTransform = function(selection,a,b){
                        selection.attr("d", function(d){
                            var h = (yError(d) === null)?[-size,size]:[(b(yValue(d) - yError(d)) - b(yValue(d))),(b(yValue(d) + yError(d)) - b(yValue(d)))],
                            w = (xError(d) === null)?[-size,size]:[(a(xValue(d) - xError(d)) - a(xValue(d))),(a(xValue(d) + xError(d)) - a(xValue(d)))];
                            
                            return "M 0," + h[0] + 
                                " L 0," + h[1] +
                                " M " + w[0] + "," + h[1] +
                                " L " + w[1] + "," + h[1] + 
                                " M " + w[0] + "," + h[0] +
                                " L " + w[1] + "," + h[0]
                        })};;
                    break;
                }
                case errormarker: {  //Normalize custom errors to 1px in their definition. Will be scaled back up here by size.
                    err.append("use").attr("class",marker + " err");
                    err.selectAll("use").attr("xlink:href","#" + marker)
                        .attr("transform",function(d){
                            return "scale(" + xError(d) + "," + yError(d) + ")"
                        });
                    break;
                }
            };

                // For quantitative scales:
                // - enter new ticks from the old scale
                // - exit old ticks to the new scale
                if (xScale.ticks) {
                    errEnter.call(errTransform, oldXScale, oldYScale);
                    errUpdate.call(errTransform, xScale, yScale);
                    errExit.call(errTransform, xScale, yScale);
                }
                
                // For ordinal scales:
                // - any entering ticks are undefined in the old scale
                // - any exiting ticks are undefined in the new scale
                // Therefore, we only need to transition updating ticks.
                else {
                    var dx = xScale.range()[1] / 2, 
                    x = function(d) { 
                        return xScale(d) + dx; 
                    };
                    var dy = yScale.range()[1] / 2, y = function(d) { return yScale(d) + dy; };
                    errEnter.call(errTransform, x, y);
                    errUpdate.call(errTransform, x, y);
                }
            });
        }

        marks.size = function(_) {
            if (!arguments.length) return size;
            size = _;
            return marks;
        };

        marks.xError = function(_) {
            if (!arguments.length) return xError;
            xError = _;
            return marks;
        };

        marks.yError = function(_) {
            if (!arguments.length) return yError;
            yError = _;
            return marks;
        };    

        marks.oldXScale = function(_) {
            if (!arguments.length) return oldXScale;
            oldXScale = _;
            return marks;
        };

        marks.oldYScale = function(_) {
            if (!arguments.length) return oldYScale;
            oldYScale = _;
            return marks;
        };

        marks.xScale = function(_) {
            if (!arguments.length) return xScale;
            xScale = _;
            return marks;
        };

        marks.yScale = function(_) {
            if (!arguments.length) return yScale;
            yScale = _;
            return marks;
        };

        marks.xValue = function(_) {
            if (!arguments.length) return xValue;
            xValue = _;
            return marks;
        };

        marks.yValue = function(_) {
            if (!arguments.length) return yValue;
            yValue = _;
            return marks;
        };

        marks.errormarker = function(_) {
            if (!arguments.length) return errormarker;
            errormarker = _;
            return marks;
        };

        return marks;
    },

    exists: function(a){
        return (a === undefined)?null:a;
    },
});