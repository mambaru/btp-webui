<ul class="nav nav-list js-left-list">
	<!--li class="nav-header js-header"><%= header %></li-->
	<% _.each(r,function(item,key){%>
		<% if (item.items) { var parent = item; %>
			<li class="<%= item.warning ? "label-warning":"" %> js-parent" data-val="grp<%=key%>">
				<a href="#"><b><%= item.name %></b></a>
			</li>
			<% _.each(item.items,function(item) { %>
				<li data-val="<%=item.val%>" data-parent-val="grp<%=key%>" style="display:none" class="hasParent <%= item.warning ? "label-warning":"" %>">
					<a href="<%= link(item.val) %>">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<%= item.name %></a>
				</li>
			<% }); %>
		<% } else { %>
			<li data-val="<%=item.val%>" class="<%= item.warning ? "label-warning":"" %> ">
				<a href="<%= link(item.val) %>"><%= item.name %></a>
			</li>
		<% } %>
	<% }) %>
</ul>

<form class="well form-search">
	<input type="text" class="input-medium search-query">
</form>

&nbsp;
<script>
	/* ToDoDo $(window).resize(); не есть гуд + может не сработать в старых браузерах и в некоторых новых */
	$(window).resize();
	$(".form-search").bind("submit",function(e) {
		e.preventDefault();
	});
	$(".form-search input").bind("keydown",_.debounce(function() {
		var v = $(this).val().toLowerCase();
		var $jsLeftList = $('.js-left-list');
		if (v && v.length>=3) {
			var pvalshow = {};
			var $jsLeftListLi = $jsLeftList.find('LI');
			$jsLeftListLi.hide();
			$jsLeftListLi.each(function() {
				var $that = $(this);
				var val = $that.attr("data-val");
				if (typeof(val) == "undefined") {
					$that.show();
				}else {
					val = val.toLowerCase();
					var b = false;
					if (v.substr(0, 1) == "^") {
						if (val.indexOf(v.substr(1)) == 0){
							b = true;
						}
					}
					else {
						if (val.indexOf(v) >= 0){
							b = true;
						}
					}
					if (b) {
						$that.show();
						pvalshow[$that.data("parent-val")] = true;
					}
				}
			});
			for (var pval in pvalshow) {
				$jsLeftListLi.filter("[data-val=\"" + pval +"\"]").show();
			}
			
		} else {
			$jsLeftListLi.filter(":not(.hasParent)").show();
			$jsLeftListLi.filter(".hasParent").hide();
			$jsLeftListLi.filter("[data-parent-val=\"" + $jsLeftListLi.filter(".active").data("parent-val")+"\"]").show();
		}
	},200)).focus();
</script>