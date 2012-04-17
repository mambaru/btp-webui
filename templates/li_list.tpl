<h3><%= header %></h3>
<ul class="nav nav-pills">
<% _.each(r,function(item){%>
	<li data-val="<%=item %>" class="<%= _.find(warnings,function(w){ return w==item;}) ? "label-warning":"" %>"><a href="<%= link(item) %>"><%= item?item:"{всё}" %></a></li>
<% }) %>
</ul>
