/*

*/

window.btpgraphid = 0;

window.btpgraph = function(ts,scale) {
	this.ts = xround(ts+1,scale,Math.round);
	this.scale = scale;
	this.dataCount = [];
	this.dataTime = [];
	this.nameCount = [];
	this.nameTime = [];
	this.pair = null;
	this.id = ++window.btpgraphid;
	return this;
};
window.btpgraph.prototype.setTs = function(ts) {
	this.ts = xround(ts+1,this.scale,Math.round);
	return this;
}
window.btpgraph.prototype.addCount = function(item,name) {
	this.dataCount.push(item);
	this.nameCount.push(name);
	return this;
};
window.btpgraph.prototype.addTime = function(item,name) {
	this.dataTime.push(item);
	this.nameTime.push(name);
	return this;
};
window.btpgraph.prototype.init = function(parent,_params) {
	$(parent).append(this.createNode());
	return this.render(_params);
};
window.btpgraph.prototype.createNode = function() {
	var elem_id = 'btpgraph'+this.id;
	return '<div id="'+elem_id+'"></div>';
};
window.btpgraph.prototype.setPair = function(pair) {
	this.pair = pair;
}

window.btpgraph.prototype.render = function(_params ) {
	var elem = $('#btpgraph'+this.id);
	elem.addClass('dygraph-many');
	elem.css('width','95%').css('height','400px');
	if (typeof(_params.css)!='undefined') elem.css(_params.css);
	var data = [];
	var keys = [];
	var self = this;
	
	if (this.dataTime.length || this.dataCount.length) {
		dataSize = (this.dataCount.length?this.dataCount:this.dataTime)[0].length;
	} else dataSize =0;
	if (dataSize==0) return;
	
	var start_ts = self.ts-dataSize*self.scale;
	
	var props = {};
	var labels = ["N"];
	for (var i=0;i<dataSize;i++) {
		data.push([ new Date(1000*(start_ts + i*self.scale)) ]);
	}

	var sums = [];
	if (_params.normalize) {
		for (var i=0;i<dataSize;i++) sums[i] = 0;
		_.each(this.dataCount,function(item) {
			_.each(item,function(v,ind) {
				sums[ind] += v.count;
			});
		});
	}
	
	var addDataTime = function(prop,add) {
		_.each(self.dataTime,function(item,ind) {
			labels.push(self.nameTime[ind]+add);//"_ts");
			for (var i=0;i<dataSize;i++) {
				var v = item[i];
				data[i].push( v.count==0?null:(v[prop]));
			}
		});
	};
	if (this.dataCount.length==1 && this.dataTime.length==1) {
		addDataTime('avg','_avg');
		addDataTime('perc50','%50');
		addDataTime('perc80','%80');
		addDataTime('perc95','%95');
		addDataTime('perc99','%99');
		props.colors = ['#0000a0', '#800000','#e00000','#ff8080','#ffb0b0','#00a000'];
//		props.customBars = true;
	} else {
		addDataTime('perc80','%80');
	}
	var firstprop = null;
	
	_.each(this.dataCount,function(item,ind) {
		labels.push(self.nameCount[ind]+"_cnt");
		if (firstprop) {
			props[self.nameCount[ind]+"_cnt"] = {axis: firstprop };
		} else {
			props[self.nameCount[ind]+"_cnt"] = {axis: {} };
			firstprop = self.nameCount[ind]+"_cnt";
		}
		if (_params.normalize) {
			for (var i=0;i<dataSize;i++) {
				var v = item[i].count;
				var d = sums[i];
				data[i].push( d==null?null:(100.0*v/d));
			}
		} else {
			for (var i=0;i<dataSize;i++) {
				var v = item[i].count;
				data[i].push( v==0?null:v);
			}
		}
	});
	
	this.graph = new Dygraph(elem[0], data,_.extend(props,{
		labels: labels,
		ylabel: this.dataTime.length?'time':' ',
		y2label: 'count',
        stackedGraph: false,

        highlightCircleSize: 2,
        strokeWidth: 1,
        strokeBorderWidth: false ? null : 1,

        highlightSeriesOpts: {
          strokeWidth: 2,
          strokeBorderWidth: 1,
          highlightCircleSize: 3,
        },
		zoomCallback : function(minDate, maxDate, yRange) {
			//showDimensions(minDate, maxDate, yRange);
			if (self.pair) self.pair.graph.updateOptions({
				dateWindow: [minDate, maxDate]
			});
		},
		axes: {
			y: {
				axisLabelFormatter: function(v) {
					if (!self.dataTime.length) return '';
					if (v==0) return '';
					if (v < 100) return v+' n';
					if (v < 500000) return (Math.round(v/100)/10)+' ms';
					return Math.round(v/100000)/10+' s';
				}
			},
			y2: _.extend({
				labelsKMB: true
			}, _params.normalize ? {valueRange: [0,100.1]} : {})
		},
		panEdgeFraction: 0.1,
		//labelsDiv: document.getElementById('status'),
		labelsDivWidth: 500,
		labelsDivStyles: {
			'background-color': 'rgba(255,0,0,0.1)', //none'
		},
		rightGap: this.dataCount.length?5:62,
		
		//fillGraph: true,
        //labelsSeparateLines: true,		
		legend: 'always'
	}, _params.props||{} ));
	return;

//	var colors = "#FF0000,#00FF00,#0000FF,#FF00FF,#00FFFF,#000000,#70DB93,#B5A642,#5F9F9F,#B87333,#2F4F2F,#9932CD,#FFFF00,#871F78,#855E42,#545454,#8E2323,#F5CCB0,#238E23,#CD7F32,#DBDB70,#C0C0C0,#527F76,#9F9F5F,#8E236B,#2F2F4F,#EBC79E,#CFB53B,#FF7F00,#DB70DB,#D9D9F3,#5959AB,#8C1717,#238E68,#6B4226,#8E6B23,#007FFF,#00FF7F,#236B8E,#38B0DE,#DB9370,#ADEAEA,#5C4033,#4F2F4F,#CC3299,#99CC32".split(",");
//	var colorind = 0;

};
