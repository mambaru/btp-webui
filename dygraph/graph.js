/*

todo:
подключить хайчартс
из window.btpgraph сделать прокси к хайчартс

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
	if (_params) elem.css(_params);
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
		for (var i=0;i<dataSize;i++) {
			var v = item[i];
			data[i].push( v.count==0?null:v.count);
		}
	});
	//console.log(props);
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
			y2: {
				labelsKMB: true
			}
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
	}));
	return;

//	var colors = "#FF0000,#00FF00,#0000FF,#FF00FF,#00FFFF,#000000,#70DB93,#B5A642,#5F9F9F,#B87333,#2F4F2F,#9932CD,#FFFF00,#871F78,#855E42,#545454,#8E2323,#F5CCB0,#238E23,#CD7F32,#DBDB70,#C0C0C0,#527F76,#9F9F5F,#8E236B,#2F2F4F,#EBC79E,#CFB53B,#FF7F00,#DB70DB,#D9D9F3,#5959AB,#8C1717,#238E68,#6B4226,#8E6B23,#007FFF,#00FF7F,#236B8E,#38B0DE,#DB9370,#ADEAEA,#5C4033,#4F2F4F,#CC3299,#99CC32".split(",");
//	var colorind = 0;

	var self = this;
	var series_data = [];
	var markers_data = [];
	var dataSize = 0;
	
	var label_time = false;
	var label_count = false;
	
	if (this.dataTime.length || this.dataCount.length) {
		dataSize = (this.dataCount.length?this.dataCount:this.dataTime)[0].length;
	} else dataSize =0;
	
	var ts_align, ts_tick;
	if (self.scale==5) {ts_align = 15*60; ts_tick = 15*60; }
	if (self.scale==60) {ts_align = 3600; ts_tick = 3600; }
	if (self.scale==1800) {ts_align = 86400; ts_tick = 86400; }
	if (self.scale==3600*6) {ts_align = 15*86400; ts_tick = 15*86400; }
	var ts_tick = ts_align;// * 6;
	var delta = Math.round((xround(self.ts,ts_align,Math.ceil)-self.ts)/self.scale);
	var slice_from = (delta+dataSize)%(ts_align/self.scale);
	var start_ts = self.ts-dataSize*self.scale+slice_from*self.scale;

	//slice_from = 0;
	//var start_ts = self.ts-dataSize*self.scale;
	
	if (this.dataCount.length==1 && this.dataTime.length==1) {
		var itemT = this.dataTime[0].slice(slice_from);
		var itemC = this.dataCount[0].slice(slice_from);
		series_data.push({name: 'perc99', type: 'area', data: _.map(itemT, function(v) { return v.count==0?null:v.perc99;}),  color: colors[0], fillColor: opacity(colors[0],0.1) });
		series_data.push({name: 'perc95', type: 'area', data: _.map(itemT, function(v) { return v.count==0?null:v.perc95;}), color: colors[0], fillColor: opacity(colors[0],0.1) });
		series_data.push({name: 'perc80', type: 'area', data: _.map(itemT, function(v) { return v.count==0?null:v.perc80;}), color: colors[0], fillColor: opacity(colors[0],0.1) });
		series_data.push({name: 'perc50', type: 'area', data: _.map(itemT, function(v) { return v.count==0?null:v.perc50;}), color: colors[0], fillColor: opacity(colors[0],0.1) });
		series_data.push({name: 'count', type: 'area', yAxis: 1, data: _.map(itemC, function(v) { return v.count;}), color: colors[1], fillColor: opacity(colors[1],0.1) });
		series_data.push({name: 'avg', type: 'area', data: _.map(itemT, function(v) { return v.count==0?null:v.avg;}), color: opacity(colors[2],0.5), fillColor: opacity(colors[2],0) });
		label_time = true; label_count = true;
	} else {
		var totalcnt = this.dataCount.length + this.dataTime.length;
		_.each(this.dataTime,function(item,v) {
			item = item.slice( slice_from );
			if (typeof(item[0].perc95)=='undefined') {
				series_data.push({name: self.nameTime[v]+'%80', data: _.map(item, function(v) { return v.count==0?null:v.perc80;}), color: opacity(colors[colorind],0.8) });
				var t = [];
				for (var i=1;i<item.length-1;i++) {
					if (!item[i-1].count && item[i].count && !item[i+1].count) {
						t.push([i,item[i].perc80]);
					}
				}
				markers_data.push({name: self.nameTime[v]+'%80', data: t, color: opacity(colors[colorind],0.8) });
			} else {
				series_data.push({name: self.nameTime[v]+'%95', data: _.map(item, function(v) { return v.count==0?null:v.perc95;}), color: opacity(colors[colorind],0.8) });
				series_data.push({name: self.nameTime[v]+'%50', data: _.map(item, function(v) { return v.count==0?null:v.perc50;}), color: opacity(colors[colorind],0.8) });
			}
			colorind = (colorind+1)%colors.length;
			label_time = true;
		});
		_.each(this.dataCount,function(item, v) {
			item = item.slice(slice_from);
			series_data.push({name: self.nameCount[v], yAxis: 1, data: _.map(item, function(v) { return v.count;}), color: opacity(colors[colorind],0.8) });
			colorind = (colorind+1)%colors.length;
			label_count = true;
		});
		if (this.dataTime.length || this.dataCount.length) {
			dataSize = (this.dataCount.length?this.dataCount:this.dataTime)[0].length;
		} else dataSize =0;
	}
	
	this.chart = new Highcharts.Chart({
		chart: {
			animation: false,
			renderTo: elem[0],
			zoomType: 'xy',
			marginLeft: 80,
			marginRight: 80,
			type: 'line',
			events: {
				selection: function(event) {
					//console.log(event);
					if (self.chart.xAxis[0].options.tickInterval) {
						self.chart.xAxis[0].options.tickInterval = null;
						self.chart.redraw();
					}
					
					if (self.pair && self.pair.chart) setTimeout(function(){
						var ext = self.chart.xAxis[0].getExtremes();
						self.pair.chart.xAxis[0].setExtremes(ext.min,ext.max);
						self.pair.chart.xAxis[0].options.tickInterval = null;
						self.pair.chart.redraw();
					},1);
					//self.pair.chart.yAxis[0].setExtremes(event.yAxis[0].min,event.yAxis[0].max-event.yAxis[0].min);
					//self.pair.chart.yAxis[1].setExtremes(event.yAxis[1].min,event.yAxis[1].max-event.yAxis[1].min);
				}
			}
		},
		title: {
			text: '', floating: true
		},
		xAxis: {
			//type: 'datetime',
			title: {
				text: '', floating: true
			},
			//startOnTick: true,
			min: 0,
			gridLineWidth: 1,
			gridLineColor: '#C0C0C0',
			tickInterval: Math.round(ts_tick/self.scale),
			labels: {
				formatter: function(full) {
					var now = new Date(1000*(start_ts + this.value*self.scale));
					if (full) {
						now = now.format("yyyy-mm-dd H:MM:ss");
					} else if (self.scale<60) {
						now = now.format("H:MM:ss");
					} else if (self.scale==60) {
						now = now.format("H:MM");
					} else {
						now = now.format("mm-dd");
					}
					return now;
				}
			}
		},
		yAxis: [{
			title: { text: label_time?'среднее время на запрос':'', floating: true },
			min: 0,
			gridLineWidth: 1,
			gridLineColor: '#E0E0E0',
			labels: { formatter: function() {
				if (this.value==0) return '';
				if (this.value < 100) return this.value+' n';
				if (this.value < 500000) return (Math.round(this.value/100)/10)+' ms';
				return Math.round(this.value/100000)/10+' s';
			}}
		},{
			opposite: true,
			min: 0,
			gridLineWidth: 0,
			title: { text: label_count?'запросов в секунду':'', floating: true },
			labels: { formatter: function() {
				if (this.value==0) return '';
				if (this.value < 1) return Math.round(this.value*10000)/10+' m';
				if (this.value > 1000) return Math.round(this.value/100)/10+' K';
				return this.value;
			}}
		}],
		tooltip: {
			formatter: function() {
				return this.series.name
					+': ' + this.series.yAxis.options.labels.formatter.apply({value:this.y},[true])
					+' @ '+ this.series.xAxis.options.labels.formatter.apply({value:this.x},[true])
				;
				//this.chart.xAxis.labels.formatter.apply(this.x);
			}
		},
		legend: {
			itemStyle: {
				'font-size': '10px',
				'height': 20
			},
			lineHeight: 5
		},
		plotOptions: {
			series: {
				//pointInterval: self.scale*1000,
				//pointStart: new Date(start_ts*1000),
				animation: false,
				shadow: false,
				marker: {
					symbol: 'circle',
					radius: 1,
					enabled: false
				}
			},
			area: {
				animation: false,
				lineWidth: 1,
				shadow: false,
				marker: {
					enabled: false,
					symbol: 'circle',
					radius: 2,
					states: {
						hover: {
							enabled: true
						}
					}
				}
			},
			line: {
				animation: false,
				lineWidth: 1,
				shadow: false
			}
		},
		series: [],
		
		exporting: {
			enabled: false
		}		

	});
	elem.find('.highcharts-legend path').attr('stroke-width',3);
	//if (series_data[0].data.length>300) {
	//	self.chart.xAxis[0].setExtremes(series_data[0].data.length-300,series_data[0].data.length);
	//}
	//self.chart.showResetZoom();
	_.each(series_data,function(item) {
		//item.marker = {enabled: true};
		//item.lineWidth = 0;
		self.chart.addSeries(item);
	});
	_.each(markers_data,function(item) {
		//item.showInLegend = false;
		item.marker = {enabled: true};
		item.lineWidth = 0;
		self.chart.addSeries(item);
	});

};
