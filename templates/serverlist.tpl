<% _.each(data,function(comment,host){%>
	<li><a href="#" data-ip="<%=host%>"><%=host%> <%=(comment?"("+comment+")" : "")%></a></li>
<%})%>
