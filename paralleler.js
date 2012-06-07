var paralleler = function() {
	var s = {};
	s.counter = 0;
	s.data = [];
	s.finish = [];
	
	s.add = function(func, func_on_result) {
		var cnt = s.counter;
		s.increment();
		func(function(result) {
			s.data[cnt] = result;
			s.decrement();
		});
		if (func_on_result) {
			s.finish.push(function(){
				func_on_result(arguments[cnt]);
			});
		}
		return s;
	};
	s.add_bind = function(func, args, func_on_result) {
		return s.add_bind_obj(window, func, args, func_on_result);
	};
	s.add_bind_obj = function(obj, func, args, func_on_result) {
		var f = function(res) {
			//if (typeof(args)!='array') args = [args];
			args.push(res);
			func.apply(obj,args);
		};
		return s.add(f, func_on_result);
	};
	s.increment = function() {
		s.counter++;
	};
	s.decrement = function() {
		s.counter--;
		if (s.counter == 0) s.finishFunc();
	};
	s.onfinish = function(func) {
		if (s.counter>0) s.finish.push(func);
		return s;
	};
	s.finishFunc = function() {
		s.counter = 0;
		var tmp_finish = s.finish.slice(0);
		s.finish = [];
		for (var i=0; i<tmp_finish.length;i++) {
			tmp_finish[i].apply(s, s.data);
		}
		s.data = [];
	};
	return s;
};
