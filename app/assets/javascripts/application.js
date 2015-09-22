// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
// WARNING: THE FIRST BLANK LINE MARKS THE END OF WHAT'S TO BE PROCESSED, ANY BLANK LINE SHOULD
// GO AFTER THE REQUIRES BELOW.
//
//= require jquery
//= require jquery-ui
//= require jStat
//= require slick
//= require slick/grid
//= require slick/dataview
//= require slick/editors
//= require slick/groupitemmetadataprovider
//= require slick/formatters
//= require slick/controls/pager
//= require slick/controls/columnpicker
//= require slick/plugins/rowselectionmodel.js
//= require slick/plugins/cellselectionmodel
//= require jquery.fileupload
//= require jquery.ui.sortable
//= require underscore-min
//= require bootstrap
//= require bootstrap-datepicker
//= require bootstrap-datetimepicker.min
// require bootstrap-multiselect
//= require jquery.multiselect
//= require jquery.multiselect.filter
//= require d3
//= require crossfilter
//= require handlebars
//= require ember
//= require ember-data
//= require ember-auth
//= require topojson
//= require_self
//= require cibi
//= require canvg
//= require rgbcolor
//= require util
//= require pivot
//=require jquery.fastLiveFilter
//= require html2canvas.min
//= require jquery.timeago
//= require bootstrap-tooltip
//= require d3.tip.v0.6.3
//= require jPages.min
//= require shrink_navbar
//= require radialProgress
//= require jquery.dataTables.min
//= require jspdf.js
//= require jspdf.plugin.addimage.js
//= require jspdf.plugin.javascript.js
//= require FileSaver.min.js
//= require jquery.floatThead
//= require d3-funnel 
//= require fusioncharts.js
//= require fusioncharts.charts.js
//= require fusioncharts.theme.fint.js

Cibi = Ember.Application.create({
	// LOG_TRANSITIONS: true,
});
//= require_tree .


document.ontouchmove = function (event) {
    event.preventDefault();
};


