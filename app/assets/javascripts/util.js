Number.prototype.formatMoney = function(c, d, t){
var n = this, 
    c = isNaN(c = Math.abs(c)) ? 2 : c, 
    d = d == undefined ? "." : d, 
    t = t == undefined ? "," : t, 
    s = n < 0 ? "-" : "", 
    i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", 
    j = (j = i.length) > 3 ? j % 3 : 0;
   return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
 };

Date.prototype.formatDate = function(){
    var n = this;
    return d3.time.format("%Y-%m-%d")(n);
};

Date.prototype.formatQuarter = function(){
	var n = this;
	return (2000 + (this.getYear() % 100)) + 'Q' + ( 1 + parseInt( n.getMonth() / 3 )) ; 
};

Date.prototype.formatMonthYear = function(){
    var n = this;
    return d3.time.format("%Y %b")(n); 
};

Date.prototype.formatHours = function(){
    var n = this;
    return d3.time.format("%H")(n); 
};
 
Date.prototype.formatMonth = function(){
    var n = this;
    var monthNames = [ "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December" ];
    return monthNames[n.getMonth()]; 
};

Date.prototype.formatDateMonth = function() {
    var n = this,
    x = n.toDateString();
    return x.substr(0, x.length - 5);
};

Date.prototype.formatWeekDay= function(){
    var n=this;
    var weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return weekdays[n.getDay()];
}

Date.prototype.getMDay = function() {
    return (this.getDay() + 6) %7;
}

Date.prototype.getISOYear = function() {
    var thu = new Date(this.getFullYear(), this.getMonth(), this.getDate()+3-this.getMDay());
    return thu.getFullYear();
}

Date.prototype.getISOWeek = function() {
    var onejan = new Date(this.getISOYear(),0,1);
    var wk = Math.ceil((((this - onejan) / 86400000) + onejan.getMDay()+1)/7);
    if (onejan.getMDay() > 3) wk--;
    return wk;
}

formatDates = function(format, dates_arr) {
    var arr = [];
    $.each(dates_arr, function(i,v){
        var date = new Date(v);
        if(isNaN(date))
        {
            arr.push(v);
        }else{
            if(date && format == 'Month'){
                arr.push(date.formatMonth());
            } else if(date && format == 'Year') {
                arr.push(date.getFullYear().toString());
            } else if(date && format == 'Quarter') {        
                arr.push(date.formatQuarter());
            } else if(date && format == 'Month Year'){
                arr.push(date.formatMonthYear());
            } else if(date && format == 'Hours'){
                arr.push(date.formatHours());
            } else if(date && format == 'Day'){
                arr.push(date.formatWeekDay());
            } else if(date && format == 'Week'){
                arr.push("W"+date.getISOWeek());
            }else if (date && format == 'Date'){
                arr.push(date.formatDate());
            }
        }
    });
    return arr.uniq();
};

Date.prototype.shortDate = function(){
    var n = this;
    return (2000 + (n.getYear() % 100)) + '/' + ( 1 + parseInt( n.getMonth())) + '/' +  n.getDate(); 
};

toFloat = function(s) {
    if(!s) {
        return 0;
    }
    if(typeof(s) == 'number'){
        return parseFloat(s);
    }else{
        return parseFloat(s.replace(/,/g, ''));
    }
    
}

isNumericDataType = function(data_type) {
    if(data_type) {
        if (data_type.toLowerCase() == "int" || data_type.toLowerCase() == "float" || data_type.toLowerCase() == "decimal" || data_type.toLowerCase() == "decimal(15,3)") {
            return true;
        }
    }
    return false;
    
}

isValidDateString = function(s) {
 	var formattedAsDate = s.indexOf(' ') >= 0 || s.indexOf('/') >= 0 || s.indexOf('-') >= 0 || s.indexOf(',') >= 0
 	return (formattedAsDate && Date.parse(s));
}

pruneStr = function(s) {
    if(s) {
        return s.replace(/[\s,:(),\/\.\&\%\\\/]/g, "-");    
    }
	return "";
}

sortStringFormat = function(s) {
    
    if(s) {
        if ( s.match(/-+\d+$/) != null ) {
            var seq = s.match(/-+\d+$/)[0];
            return parseInt(seq.replace(/^-/, ""));
        } else if(s.match(/\d+/g) == null) {
             return s;
        }

        return parseInt(s.replace(/[A-Za-z\-]/g, ''))        
    }
}

displayTick = function(s) {
    // if (typeof s != "string") {
    //     return s;
    // }
    // if ( s.match(/-+\d+$/) != null ) {
    //     return (s.replace(/-+\d+$/, ""));
    // }       

    return s;
}

alphanumericSortFunction = function(d1, d2) { 
    var s1 = d1.key;
    var s2= d2.key;
    var s1_chars = s1.replace(/[0-9\.\s]/g,'');
    var s2_chars = s2.replace(/[0-9\.\s]/g,'');
    

    if (s1_chars == s2_chars) {
        var s1_nums = s1.replace(/[A-Za-z\-]/g,'');
        var s2_nums = s2.replace(/[A-Za-z\-]/g,'');
        return parseInt(s1_nums) < parseInt(s2_nums);
    }
    return s1_chars < s2_chars;
}

formatDateLong = function(s) {
    var timestamp = new Date(s);
    var date = $.datepicker.formatDate('mm/dd/yy', timestamp);
    var hours = timestamp.getHours();
    hours = hours < 10 ? "0" + hours : hours;
    var mins = timestamp.getMinutes();
    mins = mins < 10 ? "0" + mins : mins;
    var sec = timestamp.getSeconds();
    sec = sec < 10 ? "0" + sec : sec;
    var time = hours + ":" + mins + ":" + sec
    return date + " " + time;
}

dateToday = function() {
    var timestamp = new Date();
    var date = $.datepicker.formatDate('mm/dd/yy', timestamp);
    return date;
}

addDate = function(date, type, amount){
    var date = new Date(date);
    var amount = parseInt(amount);
    var y = date.getFullYear(),
        m = date.getMonth(),
        d = date.getDate();
    if(type === 'Years'){
        y += amount;
    };
    if(type === 'Months'){
        m += amount;
    };
    if(type === 'Days'){
        d += amount;
    };
    if(type === 'Weeks'){
        d += amount*7;
    };
    if(type === 'Quarter'){
        m += amount*3;
    };         
    var result = new Date(y, m, d);
    return $.datepicker.formatDate('mm/dd/yy', result);
}

subtractDate = function(date, type, amount){
    var date = new Date(date);
    var amount = parseInt(amount);
    var y = date.getFullYear(),
        m = date.getMonth(),
        d = date.getDate();
    if(type === 'Years'){
        y -= amount;
    };
    if(type === 'Months'){
        m -= amount;
    };
    if(type === 'Days'){
        d -= amount;
    };
    if(type === 'Weeks'){
        d -= amount*7;
    };
    if(type === 'Quarter'){
        m -= amount*3;
    };        
    var result = new Date(y, m, d);
    return $.datepicker.formatDate('mm/dd/yy', result);
}

formatValue=function(d, s, precision){
    if(!precision) {
        precision = ".1f";
    }
    switch(s)
    {
        case "No Units":
            return formatKMG(d);
            break;
        case "k, M, B":
            if(Math.abs(d/1000000000)>=1){
                return d3.format(precision)(d/1000000000) + " B";
            }
            else if(Math.abs(d/1000000)>=1){
                return d3.format(precision)(d/1000000)+" M";
            }
            else if(Math.abs(d/1000)>=1){
                return d3.format(precision)(d/1000)+" k";
            }
            else{
                return d;
            }
            break;
        case "k, L, Cr":
            if(Math.abs(d/10000000)>=1){
                return d3.format(precision)(d/10000000)+" Cr";
            }
            else if(Math.abs(d/100000)>=1){
                return d3.format(precision)(d/100000)+" L";
            }
            else if(Math.abs(d/1000)>=1){
                return d3.format(precision)(d/1000)+" k";
            }
            else{
                return d;
            }
            break;
        case "Only Lakhs":
            var val = d/100000;
            val = CommaFormatted(val, "Only Lakhs");
            val = val + " L";
            return val;
            break;
        case "Only Crores":
            var val = d/10000000;
            val = CommaFormatted(val, "Only Crores");
            val = val + " Cr";
            return val;
            break;
        case "Only Millions":
            var val = d/1000000;
            val = CommaFormatted(val, "Only Millions");
            val = val + " M";
            return val;
            break;
        case "Only Billions":
            var val = d/1000000000;
            val = CommaFormatted(val, "Only Billions");
            val = val + " B";
            return val;
            break;
        default:
            return formatKMG(d);
    }    
}

formatKMG=function(d){
    if(Math.abs(d/1000000000)>=1){
        return (d/1000000000)+"G";
    }
    else if(Math.abs(d/1000000)>=1){
        return (d/1000000)+"M";
    }
    else if(Math.abs(d/1000)>=1){
        return (d/1000)+"k";
    }
    else{
        return d;
    }
}

currentTime = function() {
    var date = new Date;
    str = date.getHours() +':'+ date.getMinutes() +':'+ date.getSeconds();
    return str
}

parseDateAsQuarter=function(d){
    var date=d.split('Q');
    switch(date[1]){
        case "1": 
            date[1]="1";
            break; 
        case "2": 
            date[1]="4";
            break; 
        case "3": 
            date[1]="7";
            break; 
        case "4": 
            date[1]="10";
            break;
    }
    date=date.join('Q');
    return d3.time.format("%YQ%m").parse(date);
}

formatDateAsQuarter=function(d){
    var quarter;
    switch(d3.time.format("%m")(d)){
        case "01":
        case "02":
        case "03":
            quarter="1";
            break;
        case "04":
        case "05":
        case "06":
            quarter="2";
            break;
        case "07":
        case "08":
        case "09":
            quarter="3";
            break;
        case "10":
        case "11":
        case "12":
            quarter="4";
            break;
    }
    return d3.time.format("%YQ")(d)+quarter;
}

getChartNumber= function(chartType){
    switch(chartType){
        case "bar":
            return 1;
            break;
        case "pie":
            return 2;
            break;
        case "table":
            return 7;
            break;
        case "ctree":
            return 3;
            break;
        case "ctable":
            return 0;
            break;
        case "heatmap":
            return 5;
            break;
        case "geo":
            return 4;
            break;
        case "combo":
            return 6;
            break;
        case "line":
            return 8;
            break;
        case "multiline":
            return 9;
            break;
        case "hbar":
            return 10;
            break;
        case "area":
            return 11;
            break;
        case "stacked_area":
            return 12;
            break;
        case "scatter_plot":
            return 13;
            break;
        case "grouped_table":
            return 14;
            break;
        case "single_value":
            return 15;
            break;
        case "geo_india":
            return 16;
            break;  
        case "donut":
            return 17;
            break; 
        case "funnel":
            return 18;
            break;
        case "geo_usa":
            return 19;
            break;
        case "gauge":
            return 20;
            break;                                          
    }
}

getChartName= function(chartid){
    switch(chartid){
        case "1":
            return "bar";
            break;
        case "2":
            return "pie";
            break;
        case "7":
            return "table";
            break;
        case "3":
            return "ctree";
            break;
        case "0":
            return "ctable";
            break;
        case "5":
            return "heatmap";
            break;
        case "4":
            return "geo";
            break;
        case "6":
            return "combo";
            break;
        case "8":
            return "line";
            break;
        case "9":
            return "multiline";
            break;
        case "10":
            return "hbar";
            break;
        case "11":
            return "area";
            break;
        case "12":
            return "stacked_area";
            break;
        case "13":
            return "scatter_plot";
            break;
        case "14":
            return "grouped_table";
            break;
        case "15":
            return "single_value";
            break;
        case "16":
            return "geo_india";
            break;  
        case "17":
            return "donut";
            break;      
        case "18":
            return "funnel";
            break;   
        case "19":
            return "geo_usa";
            break;
        case "20":
            return "gauge";
            break;                                     
    }
},

CommaFormatted=function(amount, format,factformat){
    if(["k, L, Cr", "Indian", "Only Lakhs", "Only Crores"].contains(format)){
        var n
        if(["Only Lakhs", "Only Crores"].contains(format)){            
            n = amount.toString();  
        }else{
            n = d3.format('.2f')(amount);  
        }        
        var afterPoint = '';
        if(n.indexOf('.') > 0){
           afterPoint = n.substring(n.indexOf('.'),n.length);
        }
        if(n < 0 && n > -1){
            var res = n.toString();
        }else{
            if(n > 0){
                n = Math.floor(n);
            }else{
                n = Math.ceil(n);
            }
            n=n.toString();
            var lastThree = n.substring(n.length-3);
            var otherNumbers = n.substring(n.length-7,n.length-3);
            var crores=n.substring(0,n.length-7);
            if(otherNumbers != '' && !(isNaN(otherNumbers)))
                lastThree = ',' + lastThree;
            if(crores != '' && !(isNaN(crores)))
                otherNumbers=',' + otherNumbers;           
            if(factformat){
                var res =crores+otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
            }else{
                var res =crores+otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
            }
        }
        return res;
    }else if(["Only Millions", "Only Billions"].contains(format)){
        if(factformat){
            return d3.format(',')(amount.toString());
        }else{
            return d3.format(',.f')(amount.toString());
        }
    }
    else{
        if(factformat){
            return d3.format(',')(amount);
        }else{
            return d3.format(',.2f')(amount);
        }
    }
},

revrseFormatting = function(no,s){
    switch(s){
        case "k":
            return no * 1000;
            break;
        case "L":
            return no * 100000;
            break;
        case "M":
            return no * 1000000;
            break;
        case "Cr":
            return no * 10000000;
            break;
        case "B" :
            return no * 1000000000;
            break;
        default:
            return no;
            break;
    }
},

(function($) {
    $.QueryString = (function(a) {
        if (a == "") return {};
        var b = {};
        for (var i = 0; i < a.length; ++i)
        {
            var p=a[i].split('=');
            if (p.length != 2) continue;
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    })(window.location.search.substr(1).split('&'))
})(jQuery);

var _chartValueProps = [
  "Total Email campaigns", "Total impressions", "Count of NECTABR", "AVG of ASSET", "SUM of ASSET", "Avg of DEPSUM"
];

var _parseDate = function(string) {
  var months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months[parseInt(string)];
}