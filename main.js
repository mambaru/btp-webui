/* ToDoDo можно ли закешировать $loader один раз, чтобы к нему не стучать постоянно */
window.btp = {
	host: '127.0.0.1',
	
	loader: 0,
	loader_inc: function() {
		this.loader++;
		if (this.loader == 1) {
			setTimeout(function() {
				var $loader = $('#loader');
				if (window.btp.loader>0) $loader.modal('show');
			},100);
		}
	},
	loader_dec: function() {
		this.loader--;
		var $loader = $('#loader');
		if (this.loader==0)	$loader.modal('hide');
	},
	query: function(method,params,cb) {
		if (method) {
			//console.log({host: window.btp.host, method: method, params: JSON.stringify(params)});
			window.btp.loader_inc();
			window.$.post(
				'js.php',
				{
					host: window.btp.host,
					method: method,
					params: JSON.stringify(params)
				},
				function(data) {
					//console.log(data);
					cb(data);
					window.btp.loader_dec();
				},
				'json'
			);
		} else {
			cb(params);
		}
	},
	multi_query: function(data, cb) {
		var prl = new paralleler();//btp.parallel
		_.each(data,function(item) {
			prl.add_bind_obj(btp, btp.query, item);
		});
		prl.onfinish(cb);
	},
	show: function(template_name,data, el) {
		var tpl = $("#"+template_name+"_tpl").html();
		if (!tpl) throw template_name;
		var tpld = _.template(tpl, data||{});
		if (el) $(el).html(tpld);
		return tpld;
	},
	query_show: function(template_name, method, params, callback) {
		window.btp.query(method,params,function(data) {
			var tpl_res = window.btp.show(template_name, data);
			callback(tpl_res, data);
		});
	},
	parallel : new paralleler()
};

function str_replace(from, to, str) {
	return str.split(from).join(to);
}
function encodeparam(p) {
	return encodeURI(p).split("/").join("*");
}
function decodeparam(p) {
	return p.split("*").join("/");
}
/*function getLink() {
	var s = "#";
	for (var i=0;i<arguments.length;i++) {
		s += encodeparam(arguments[i]) + "/";
	}
	return s;
}*/
function getLink() {
	var s = "#";
	var p = App.getLinkParams();
	for (var i=0,argumentsLength=arguments.length;i<argumentsLength;i++) {
		var argument = arguments[i];
		if (typeof(argument)=='object') {
			p = _.extend(p,argument);
		} else {
			s += encodeparam(argument) + "/";
		}
	}
	var i = 0;
	_.each(p,function(v, k) {
		s += (i==0?"?":"&") + k +"=" + encodeparam(v);
		i++;
	});
//	console.log([arguments,s]);
	return s;
}

function transform_list(type,data,warnings) {
	var conf = App.groupConfig[type];
	
	var rconf = _.map(conf, function(confitem,order) {
		confitem.items = _.map(confitem.items, function(x) { return new RegExp(x); } );
		confitem.order = order;
		return confitem;
	});

	var res_single = [];
	var res_group = {};
	_.each(rconf, function(x) { res_group[x.title] = [];});
	
	for (var i = 0,dataLength=data.length; i < dataLength; i++) {
		var dataI = data[i];
		if (dataI != "") {
			var item = {
				name: dataI,
				val: dataI,
				warning: false,
				items: null
			};
			
			if (warnings && warnings.length && _.find(warnings, function(w){
				return w == item.val;
			})) {
				item.warning = true;
			}

			var group = _.find(rconf, function(rconfitem){
				return _.find(rconfitem.items, function(x){
					return x.test(item.val);
				});
			});
			if (group) {
				if (group.replace) {
					item.name = item.name.split(group.replace).join('');
				}
				res_group[group.title].push(item);
			} else {
				res_single.push(item);
			}
		}
	}
	var res = [];
	_.map(res_group, function(items,key) {
		if (items.length) {
			res.push({name: key, items: items, warning: _.find(items,function(i) { return item.warning;}) ?true:false });
		}
	});
	_.map(res_single, function(item) { res.push(item); });
	return res;
}

var App = window.App||{};
App.loading = false;
App.scale = 5;
App.current_width = 800;

App.setHost = function(x) {
	var activeClass = 'active';
	if (window.location.hash.indexOf("host=" + window.btp.host) >= 0) {
		window.location.hash = window.location.hash.replace("host=" + window.btp.host, "host=" + x);
	}
	window.btp.host = x;
	App.saveCookie();
	
	var $jsServerSelector = $('.js-server-selector');
	$jsServerSelector.find('LI').removeClass(activeClass);
	var $newActiveLink = $jsServerSelector.find('A[data-ip="'+window.btp.host+'"]');
	$newActiveLink.parent().addClass(activeClass);
	$jsServerSelector.find('A.dropdown-toggle SPAN').text($newActiveLink.text());

};
App.setScale = function(x) {
	var activeClass = 'active';
	if (window.location.hash.indexOf("scale=" + App.scale) >= 0) {
		window.location.hash = window.location.hash.replace("scale=" + App.scale, "scale=" + x);
	}
	App.scale = x*1;
	App.saveCookie();

	var $jsScaleSelector = $('.js-scale-selector');
	$jsScaleSelector.find('LI').removeClass(activeClass);
	var $newActiveLink = $jsScaleSelector.find('A[data-value="'+App.scale+'"]');
	$newActiveLink.parent().addClass(activeClass);
	$jsScaleSelector.find('A.dropdown-toggle SPAN').text($newActiveLink.text());
};
App.saveCookie = function () {
	document.cookie = "JCB{host="+window.btp.host+"&scale=" + App.scale+"}JCE";
};

App.getLinkParams = function() {
	return {
		host: window.btp.host,
		scale: App.scale
	};
}
App._parse_url_hlp = function(str) {
	var p = str.split("?");
	var path = _.map(p[0].split("/"),decodeparam);
	//if (path[path.length-1]=="") path = path.slice(0,path.length-1);
	return {
		args: getJsonFromUrl(p[1] || ""),
		path: path, length: path.length-1
	};
}
App.parse_url = function(str) {
	var p = App._parse_url_hlp(str);
	if (p.args.host) {
		App.setHost(p.args.host);
	}
	if (p.args.scale) {
		App.setScale(p.args.scale);
	}
	return p;
}

function curry(func, arg) {
	var args = [];
	for (var i=1,argumentsLength=arguments.length;i<argumentsLength;i++) {
		args.push(arguments[i]);
	}
	return function() {
		carg = _.clone(args);
		for (var i = 0, argumentsLength = arguments.length; i < argumentsLength; i++) {
			carg.push(arguments[i]);
		}
		return func.apply(func,carg);
	};
}

function getJsonFromUrl(query) {
	var data = query.split("&");
	var result = {};
	for(var i=0,dataLength=data.length; i<dataLength; i++) {
		var item = data[i].split("=");
		result[item[0]] = item[1];
	}
	return result;
}

function mkscale(item,scale) {
	item.count = item.count/scale;
	return item;
}
function xround(val, scale, rounder) {
	return rounder(val/scale)*scale;
}

function draw_pair(elem,data1,data3,from,from_scale) {
	from = from*1;
	var g1 = new window.btpgraph(data1.ts,data1.scale);
	for (var op in data1.data) {
		var t = [];
		var tmpcnt = 0;
		var tmpprev = 0;
		for (var i=from+Math.floor(data1.data[op].length*from_scale),data1Length=data1.data[op].length;i<data1Length;i++) {
/*				if (!data3.data[op][i] && (i>=3 && i+1<data3.data[op].length)) {
				if (data3.data[op][i-1] && data3.data[op][i+1]) {
					tmpcnt = 0;
				} else {
					tmpcnt = data3.data[op][i-1] && data3.data[op][i-2] || data3.data[op][i+1] && data3.data[op][i+2];
				}
			} else {
				tmpcnt = data3.data[op][i];
			}*/
			tmpcnt = data3.data[op][i];
			//t.push({perc80: data1.data[op][i], count: tmpcnt==2 || tmpcnt==3 || tmpcnt==100?'-':0});
			t.push({perc80: data1.data[op][i], count: tmpcnt>0 ? '-':0});
		}
		if (!t.length) continue;
		g1.addTime(t,op);
	}
	g1.init(elem,{width: App.current_width});

	var g2 = new window.btpgraph(data3.ts,data3.scale);
	for (var op in data3.data) {
		var t = [];
		for (var i=from+Math.floor(data3.data[op].length*from_scale),data3Length=data3.data[op].length;i<data3Length;i++) {
			t.push({count: data3.data[op][i] / data3.scale, perc95: 0});
		}
		if (!t.length) continue;
		g2.addCount(t,op);
	}
	g2.init(elem,{width: App.current_width});
	g1.setPair(g2);
	g2.setPair(g1);
}

$(function(){
	
	btp.show('serverlist', {data: App.hostConfig}, '#serverlist');
	for (var k in App.hostConfig) {
		window.btp.host = k;
		break;
	}
	
	App.scale = 5;
	
	var m = document.cookie.match(/JCB\{(.+)\}JCE/);
	if (m!=null) {
		var data = getJsonFromUrl(m[1]);
		if (typeof(data.scale)!='undefined') App.scale = data.scale*1;
		if (typeof(data.host)!='undefined') window.btp.host = data.host;
	}
	App.setScale(App.scale);
	App.setHost(window.btp.host);


	new App.Controllers();

	btp.show('layout',{},'#content');

	$('.js-server-selector UL A').bind('click',function(e) {
//		$(this).parent().siblings('.active').removeClass('active');
//		$(this).parent().addClass('active');
		App.Updaters.reset();
		App.setHost($(this).attr('data-ip'));
		
		Backbone.history.reload();
		return true;
	});

	$('.js-scale-selector UL A').bind('click',function(e) {
//		$(this).parent().siblings('.active').removeClass('active');
//		$(this).parent().addClass('active');
		App.Updaters.reset();
		App.setScale($(this).attr('data-value'));
		
		Backbone.history.reload();
		return true;
	});

	var $jsMainmenu = $('.js-mainmenu');
	$jsMainmenu.bind('click',function(e) {
		var $that = $(this);
		$jsMainmenu.removeClass('active');
		$that.addClass('active');
		return true;
	});
	
	$('UL.dropdown-menu LI A').live('click',function(e) {
		var $thatParent = $(this).parent();
		$thatParent.siblings('.active').removeClass('active');
		$thatParent.addClass('active');
		e.preventDefault();
	});
	$('UL LI A.js-reload').bind('click',function(e) {
		App.Updaters.reset();
		Backbone.history.reload();
		e.preventDefault();
	});
	
	$(window).resize(function() {
		App.current_width = $(window).width()-600;
	}).resize();
	
	Backbone.history.start();
	Backbone.history.reload = function() {
		Backbone.history.loadUrl();
	}

	
	//TODO:
	//window.btp.query("get_warnings",{script:"?",service:'SCRIPT', scale:1800},function(res){ });
	//window.btp.query("get_warnings",{service:'?',scale:1800},function(res){ });

});
