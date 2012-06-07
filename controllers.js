var App = window.App||{};

App.Updaters = {
	index: {},
	reset: function() {
		this.index = {};
	},
	header: function(type) {
		var $navbarLI = $('.navbar UL.nav LI');
		$navbarLI.removeClass('active');
		$navbarLI.filter('[data-type="'+type+'"]').addClass('active');
	},
	update_left_selection: function (selected) {
		var $contentLeftLI = $('#content-left LI');
		$contentLeftLI.removeClass('active');
		$contentLeftLI.filter('[data-val="'+selected+'"]').each(function() {
			var $that = $(this);
			$that.addClass('active');
			$contentLeftLI.filter('[data-parent-val="' +$that.data('parent-val')+'"]').show();
		});
	},
	left_dashboards: function(selected) {
		if (App.Updaters.index.left == 'dashboards') {
			this.update_left_selection(selected);
		} else {
			$('.js-mainmenu').filter('[data-type="dashboard"]').click();
			
			var data = Dashboards.getList();
			btp.show('left_list',{r: data, link: curry(getLink, 'dashboard'), header : 'Дашборды'},'#content-left');
			App.Updaters.update_left_selection(selected);
			var $contentLeftLI = $('#content-left LI');
			$contentLeftLI.filter('.js-parent').bind('click',function(e) {
				var $that = $(this);
				$contentLeftLI.filter('[data-parent-val="' + $that.data('val')+'"]').toggle();
				e.preventDefault();
			});
		}
		App.Updaters.index.left = 'dashboards';
		$('.form-search').find('input').focus();
	},
	left_services: function(selected) {
		if (App.Updaters.index.left == 'services') {
			this.update_left_selection(selected);
		} else {
			$('.js-mainmenu').filter('[data-type="service"]').click();
			btp.multi_query([
				['get_list', {service:'?'}]
				//,['get_warnings', {service:'?',scale:1800}]
			], function(data,warn) {
				data = transform_list('services',data,warn);
				btp.show('left_list',{r: data, link: curry(getLink, 'service'), header : 'Сервисы'},'#content-left');
				App.Updaters.update_left_selection(selected);
				var $contentLeftLI = $('#content-left LI');
				$contentLeftLI.filter('.js-parent').bind('click',function(e) {
					var $that = $(this);
					$contentLeftLI.filter('[data-parent-val="' + $that.data('val')+'"]').toggle();
					e.preventDefault();
				});
			});
		}
		App.Updaters.index.left = 'services';
		$('.form-search').find('input').focus();
	},
	left_scripts: function(selected) {
		if (App.Updaters.index.left == 'scripts') {
			this.update_left_selection(selected);
		} else {
			$('.js-mainmenu[data-type="script"]').click();
			btp.multi_query([
				['get_list', {script:'?'}]
				//,['get_warnings', {service:'SCRIPT_wwwnew',script:'?',scale:1800}]
			], function(data,warn){
				data = transform_list('scripts',data,warn);
				btp.show('left_list',{r: data, link: curry(getLink, 'script'), header: 'Скрипты'},'#content-left');
				App.Updaters.update_left_selection(selected);
				$('#content-left LI.js-parent').bind('click',function() {
					$('#content-left LI[data-parent-val="' + $(this).data('val')+'"]').toggle();
					return false;
				});
			});
		}
		App.Updaters.index.left = 'scripts';
		$('.form-search').find('input').focus();
	},
	left_empty : function() {
		App.Updaters.index.left = 'empty';
		var $contentLeft = $('#content-left');
		$contentLeft.html('');
	},
	
	right_empty : function() {
		var $contentRight = $('#content-right');
		$contentRight.html('');
		App.Updaters.index.right = 'empty';
	},
	right_container: function(force) {
		if (force || App.Updaters.index.right != 'container') {
			btp.show('right_container', {}, '#content-right');
			this.makeempty('right_top');
			this.makeempty('right_middle');
			this.makeempty('right_middle2');
			this.makeempty('right_bottom');
		}
		App.Updaters.index.right = 'container';
	},
	
	_right_x : function(key, name,cb,cb2) {
		if (App.Updaters.index[key]!=name) {
			$('#'+key).html('');
			cb('#'+key);
		} else {
			cb2?cb2('#'+key):null;
		}
		App.Updaters.index[key]=name;
	},
	right_top: function(name, cb,cb2) { return App.Updaters._right_x("right-top", name,cb,cb2); },
	right_middle: function(name,cb,cb2) { return App.Updaters._right_x("right-middle", name,cb,cb2); },
	right_middle2: function(name,cb,cb2) { return App.Updaters._right_x("right-middle2", name,cb,cb2); },
	right_bottom: function(name,cb,cb2) { return App.Updaters._right_x("right-bottom", name,cb,cb2); },
	
	makeempty: function(pos) {
		App.Updaters[pos]('empty',function(element) { $(element).html(''); });
	},
	makelist: function(pos,header, key,data, link, addEmpty, selected, callback) {
		var select_cb = function(element) {
			var activeClass = 'active';
			$('LI',element).removeClass(activeClass);
			if (typeof(selected)!='undefined') {
				$('LI[data-val="'+selected+'"]',element).addClass(activeClass);
			}
		}
		App.Updaters[pos](key, function(element) {
			btp.multi_query([
				['get_list', data ]
				//,['get_warnings', $.extend(data,{scale:1800}) ]
			], function(res,warn){
				if (addEmpty && res.length>1) res.push("");
				btp.show('li_list',{r: res, link: link, warnings: warn, header: header},element);
				select_cb(element);
				callback ? callback(res) : null;
			});
		},function(elem) { select_cb(elem); callback ? callback(null) : null; } );
	},

	dummy: null
};

App.OldControllers = {
    script: function (name) {
		name = decodeparam(name);
		App.Updaters.left_scripts(name);
		App.Updaters.right_container(true);
		App.Updaters.makelist('right_top','Сервисы, которые используются из '+name,'services_of_'+name,{script:name,service:'?'}, curry(getLink,'script',name),false);
		App.Updaters.makeempty('right_bottom');
		/*App.Updaters.right_bottom('script_'+name, function(element) {
			btp.multi_query([
				['get_multigraph', {field: 'perc80', script:name,service:'*', scale: App.scale}]
				,['get_multigraph', {field: 'count', script:name,service:'*', scale: App.scale}]
			], function(data1,data3) {
				draw_pair(element,data1,null,data3,0,0.5);
			});
		});*/
	},

	service: function (name) {
		name = decodeparam(name);
		App.Updaters.left_services(name);
		App.Updaters.right_container(true);
		App.Updaters.makelist('right_top','Серверы, которые обслуживают сервис '+name,'servers_of_'+name,{service:name,server:'?'}, curry(getLink,'service',name),true, undefined, function(res) {
			if (res.length==1) {
				Backbone.history.navigate(getLink('service',name,res[0]), {trigger: true, replace: true});
			} else {
				Backbone.history.navigate(getLink('service',name,""), {trigger: true, replace: true});
			}
		});
	},
	service_srv: function (name,server) {
		name = decodeparam(name);
		server = decodeparam(server);
		if (server=="@") server = "";
		App.Updaters.left_services(name);
		App.Updaters.right_container();
		App.Updaters.makelist('right_top','Серверы, которые обслуживают сервис '+name,'servers_of_'+name,{service:name,server:'?'}, curry(getLink,'service',name),true,server);
		App.Updaters.makelist('right_middle','Операции на сервере '+server,'ops_'+server,{service:name,server:server,op:'?'}, curry(getLink,'service',name,server),false);
		App.Updaters.makeempty('right_middle2');
		App.Updaters.right_bottom('service_'+name+"_"+server, function(element) {
			btp.multi_query([
				['get_multigraph', {field: 'perc80', service:name,server: server, op:'*', scale: App.scale}]
				,['get_multigraph', {field: 'count', service:name,server: server, op:'*', scale: App.scale}]
			], function(data1,data2) {
				draw_pair(element,data1,data2,0,0.5);
			});
		});
	},
	service_srv_op: function (name,server,op) {
		name = decodeparam(name);
		server = decodeparam(server);
		if (server=="@") server = "";
		App.Updaters.left_services(name);
		App.Updaters.right_container();
		App.Updaters.makelist('right_top','Серверы, которые обслуживают сервис '+name,'servers_of_'+name,{service:name,server:'?'}, curry(getLink,'service',name),true,server);

		App.Updaters.right_middle2('gr_'+name+'_'+server+'_'+op, function(element) {
			btp.query('get_graph', {service: name, server: server, op: op, scale: App.scale }, function(res) {
				$('#graphs').html('');
				var g = new window.btpgraph(res.ts,res.scale);
				var t= [];
				for (var i = 0, resDataLength = res.data.length; i < resDataLength; i++) {
					t.push(mkscale(res.data[i], res.scale));
				}
				
				g.addCount(t,op).addTime(t,op);
				g.init(element,{width: App.current_width});
			});
		});

		App.Updaters.right_bottom('empty',function(element) {});
		var limit = 10;
		App.Updaters.makelist('right_middle','Операции на сервере '+server,'ops_'+server,{service:name,server:server,op:'?'}, curry(getLink,'service',name,server),false,op, function() {
			var reload_rb = function() {
				App.Updaters.right_bottom('gr_'+name+'_'+server+'_'+op+limit,function(element) {
					if (server!="_" && server!="" && $('#right-top LI A').length!=1) return;
					btp.query('get_list',{service:name, op:op, script: "?", limit: limit}, function(res2) {
						btp.show('li_list',{r: res2, link: curry(getLink,'script'), warnings: [],header: 'Скрипты, которые вызывают '+op+' сервиса '+name+" (top"+limit+" / <a href='#'>top"+(limit+20)+"</a>)"},'#right-bottom');
						_.each(res2,function(script) { if (script) {
							btp.parallel.add_bind_obj(
								btp,
								btp.query,
								['get_graph',{script:script, service: name, op: op, scale: App.scale}]
							);
						}});
						btp.parallel.onfinish(function(){
							if (!arguments.length) return;
							var res = arguments[0];
							var g1 = new window.btpgraph(res.ts,res.scale);
							var g2 = new window.btpgraph(res.ts,res.scale);
							for (var a=0,argumentsLength=arguments.length;a<argumentsLength;a++) {
								var res = arguments[a];
								var t = [];
								for (var i = Math.floor(res.data.length / 2); i < res.data.length; i++) {
									t.push(mkscale(res.data[i], res.scale));
								}
								if (!t.length) {
									continue;
								}
								g1.addTime(t,res2[a]);
								g2.addCount(t,res2[a]);
							}
							g1.init(element,{width: App.current_width});
							g2.init(element,{width: App.current_width});
							g1.setPair(g2);
							g2.setPair(g1);
						});
						$('#right-bottom h3 a').unbind('click').bind('click',function(e) {
							limit += 20;
							reload_rb();
							e.preventDefault();
						});
					});
				});
			};
			reload_rb();
		});
	},	
	
	script_service: function (name,service) {
		name = decodeparam(name);
		service = decodeparam(service);
		App.Updaters.left_scripts(name);
		App.Updaters.right_container();
		App.Updaters.makelist('right_top','Сервисы, которые используются из '+name,'services_of_'+name,{script:name,service:'?'}, curry(getLink,'script',name),false,service);
		App.Updaters.makelist('right_middle','Операции с сервисом '+service+", которые используются из "+name,'ops_'+service,{script:name,service:service,op:'?'}, curry(getLink,'script',name,service),false);
		App.Updaters.makeempty('right_middle2');
		App.Updaters.right_bottom('script_'+name+"_"+service, function(element) {
			btp.multi_query([
				['get_multigraph', {field: 'perc80', script: name, service:service, op: '*', scale: App.scale}]
				,['get_multigraph', {field: 'count', script: name, service:service, op: '*', scale: App.scale}]
			], function(data1,data2) {
				draw_pair(element,data1,data2,0,0.5);
			});
		});
	},

	script_service_op: function (name,service,op) {
		name = decodeparam(name);
		service = decodeparam(service);
		App.Updaters.left_scripts(name);
		App.Updaters.right_container();
		App.Updaters.makelist('right_top','Сервисы, которые используются из '+name,'services_of_'+name,{script:name,service:'?'}, curry(getLink,'script',name),false,service);
		App.Updaters.makelist('right_middle','Операции с сервисом '+service+", которые используются из "+name,'ops_'+service,{script:name,service:service,op:'?'}, curry(getLink,'script',name,service),false,op);
		App.Updaters.makeempty('right_middle2');

		App.Updaters.right_bottom('script_'+name+"_"+service+"_"+op, function(element) {
			btp.query('get_graph', {script:name, service: service, op: op, scale: App.scale }, function(res) {
				var g = new window.btpgraph(res.ts,res.scale);
				var t= [];
				for (var i = 0, resDataLength = res.data.length; i < resDataLength; i++) {
					t.push(mkscale(res.data[i], res.scale));
				}
				
				g.addCount(t,op).addTime(t,op);
				g.init(element,{width: App.current_width});
			});
		});
	},
	
	
	index: function () {
		btp.show("index", {}, '#contentRight');
	},
	
	dummy: null
};


App.Controllers = window.Backbone.Router.extend({
    routes: {
        "service/*str": "service",
        "script/*str": "script",
        "dashboard/*str": "dashboard",
        "": "index"
	},
	oldctl : null,
	initialize: function(options) {
		this.oldctl = App.OldControllers;
	},
	script: function(str) {
		var p = App.parse_url(str);
		if (p.length == 0) {
			return this.scripts();
		}

		var f = '';
		if (p.length == 3) {
			f = 'script_service_op'
		} else if (p.length == 2) {
			f = 'script_service'
		} else {
			f = 'script';
		}
		return this.oldctl[f].apply(this.oldctl,p.path);
	},
	service: function(str) {
		var p = App.parse_url(str);
		if (p.length == 0) {
			return this.services();
		}
		var f = '';
		if (p.length==3){
			f = 'service_srv_op'
		} else if (p.length==2){
			f = 'service_srv'
		} else{
			f = 'service';
		}
		return this.oldctl[f].apply(this.oldctl,p.path);
	},
	dashboard: function(str) {
		var p = App.parse_url(str);
		if (p.length==0) {
			App.Updaters.left_dashboards();
			App.Updaters.right_empty();
		} else {
			App.Updaters.left_dashboards(p.path[0]);
			App.Updaters.right_empty();
			App.Updaters.index.right = 'dashboard';
			Dashboards[p.path[0]]( $('#content-right') );
		}
	},
	
	scripts: function() {
		App.Updaters.left_scripts();
		App.Updaters.right_empty();
	},
	services: function() {
		App.Updaters.left_services();
		App.Updaters.right_empty();
	},
	index: App.OldControllers.index
});
