
var DashboardsHelpers = {
	makegraph_srv: function(params,items,scale, slice, caption) {
		var u_params = encodeURI(JSON.stringify( _.extend(params,{scale: scale}) ));
		var u_items = encodeURI(JSON.stringify(items));
		var p_caption = '';
		if (typeof(caption) != 'undefined') {
			p_caption = '&title=' + encodeURI(caption);
		}
		return '<img width="530" height="250" src="graph.php?params='+u_params+p_caption+'&items='+u_items+'&scale='+scale+'&slice='+slice+'&host='+window.btp.host+'"> ';
	},
	makegraph_client: function(params,items,scale, slice, caption) {
		var g = new window.btpgraph(0,scale);
		btp.query('get_graph', _.extend(params,{scale: scale},items[0]), function(res) {
			var t= [];
			for (var i = 0; i < res.data.length; i++) {
				t.push(mkscale(res.data[i], res.scale));
			}
			if (slice==="count") {
				g.addCount(t,caption);
			} else {
				g.addTime(t,caption);
			}
			g.setTs(res.ts);
			g.render({width: '530px',height: '250px', display:'inline-block'});
		});
		return g.createNode();
	},
	makegraphlist: function(res, params, key, href) {
		var html = [];
		html.push("<div style='white-space:nowrap;'>");// style='overflow-x: scroll; min-width: 1600px;white-space:nowrap;'>");
		res = res.slice(0,30);
		_.each(res,function(item) {
			var items = {};
			items[key] = item;
			items = [items];
			html.push("<a href='"+href.replace("@@",encodeparam(item))+"'>");
			html.push(DashboardsHelpers.makegraph_srv(params,items, 60, 'perc80', item));
			html.push(DashboardsHelpers.makegraph_srv(params,items, 1800, 'perc80', item));
			html.push(DashboardsHelpers.makegraph_srv(params,items, 21600, 'perc80', item));
			html.push('<br/>');
			html.push(DashboardsHelpers.makegraph_srv(params,items, 60, 'count', item));
			html.push(DashboardsHelpers.makegraph_srv(params,items, 1800, 'count', item));
			html.push(DashboardsHelpers.makegraph_srv(params,items, 21600, 'count', item));
			html.push("</a>");
			html.push('<br/>');
		});
		html.push("</div>");
		return html.join("");
	}
};

var Dashboards = {
	getList: function() {
		return [
// пропишите правильный service!
//			{name: "топ php - frontend - cnt", val: "php_top_front_cnt"}
//			,{name: "топ php - frontend - total", val: "php_top_front_total"}
//			,{name: "топ php - frontend - time", val: "php_top_front_time"},
			{name: "топ сервисы", val: "top_service"}
		];
	},

	php_top_front_cnt: function(node) {
		var params = {service: 'SCRIPT_wwwnew', op: 'all'};
		btp.query('get_list_advanced', _.extend(params,{script:'?', sort_by: 'count', limit: 10}), function(res) {
			var html = DashboardsHelpers.makegraphlist(res, params, 'script', "#script/@@/SCRIPT_wwwnew/");
			node.html(html);
		});
	},
	php_top_front_total: function(node) {
		var params = {service: 'SCRIPT_wwwnew', op: 'all'};
		btp.query('get_list_advanced', _.extend(params,{script:'?', sort_by: 'total', limit: 10}), function(res) {
			var html = DashboardsHelpers.makegraphlist(res, params, 'script', "#script/@@/SCRIPT_wwwnew/");
			node.html(html);
		});
	},
	php_top_front_time: function(node) {
		var params = {service: 'SCRIPT_wwwnew', op: 'all'};
		btp.query('get_list_advanced', _.extend(params,{script:'?', sort_by: 'perc80', limit: 10}), function(res) {
			var html = DashboardsHelpers.makegraphlist(res, params, 'script', "#script/@@/SCRIPT_wwwnew/");
			node.html(html);
		});
	},
	top_service: function(node) {
		var params = {service: '?'};
		btp.query('get_list_advanced', _.extend(params,{limit: 30, sort_by: 'count'}), function(res) {
			var html = DashboardsHelpers.makegraphlist(res, params, 'service', "#service/@@//");
			node.html(html);
		});
	},

	dummy: null
};
