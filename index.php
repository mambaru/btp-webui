<!DOCTYPE html>
<html lang="en">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	<meta charset="utf-8">
	<?php $v = 5; ?>
	<title>Новая пинба</title>
	<link rel="stylesheet" href="bootstrap/css/bootstrap.css" type="text/css">
	<link rel="stylesheet" href="bootstrap/css/bootstrap-responsive.min.css" type="text/css">
	<link rel="stylesheet" href="main.css" type="text/css">
	<script src="jquery-1.7.1.min.js"></script>
	<script src="bootstrap/js/bootstrap.js"></script>
	
	<script src="backbone/json2.js"></script>
	<script src="backbone/underscore.js"></script>
	
	<script src="dygraph/dygraph-combined.js?v=<?=$v?>"></script>
	<script src="dygraph/graph.js?v=<?=$v?>"></script>
	
	<script src="backbone/backbone.js?v=<?=$v?>"></script>
	<script src="paralleler.js?v=<?=$v?>"></script>
	<script src="date.format.js"></script>
	
	<script src="controllers.js?v=<?=$v?>"></script>
	<script src="config.js?v=<?=$v?>"></script>
	<script src="main.js?v=<?=$v?>"></script>
	<script src="dashboards.js?v=<?=$v?>"></script>
	
	<style type="text/css" media="screen">
		body, #content {overflow-y: hidden;}
		body {overflow-x: hidden;}
		#content-right {overflow-y: scroll;}
		.holder {
			height: 300px;
			xmargin: -125px 0 0 -400px;/* ToDoDo xmargin */
			width: 800px;
			display:inline-block;
		}
		#content-left .js-left-list {
			overflow-y: scroll;
			overflow-x: hidden;
			height:800px;
		}
		#content-left .js-left-list > li > a {overflow-x: hidden;}
		.dygraph-many .dygraph-legend > span { display: none; }
		x.dygraph-many .dygraph-legend { opacity:0.5; }/* ToDoDo x. */
		.dygraph-many .dygraph-legend > span.highlight { display: inline; }
		.fl-r{float:right !important;}
	</style>
</head>
<body>
	<div class="xnavbar">
		<div class="xnavbar-inner">
			<div class="container subnav">
				<ul class="nav nav-pills">
					<li data-type="service" class="js-mainmenu"><a href="#service/">Сервисы</a></li>
					<li data-type="script" class="js-mainmenu"><a href="#script/">Скрипты</a></li>
					<li data-type="dashboard" class="js-mainmenu"><a href="#dashboard/">Дашборды</a></li>
					<li class="fl-r"><a href="#" class="js-reload">Обновить</a></li>
					<li class="fl-r js-server-selector dropdown">
						<a href="#" class="dropdown-toggle" data-toggle="dropdown">Сервер: <span></span><b class="caret"></b></a>
						<ul class="dropdown-menu" id="serverlist">
						</ul>
					</li>
			 		<li class="fl-r js-scale-selector dropdown">
						<a href="#" class="dropdown-toggle" data-toggle="dropdown">Масштаб <span></span><b class="caret"></b></a>
						<ul class="dropdown-menu">
							<li><a href="#" data-value="5">5 секунд</a></li>
							<li><a href="#" data-value="60">1 минута</a></li>
							<li><a href="#" data-value="1800">30 минут</a></li>
							<li><a href="#" data-value="21600">6 часов</a></li>
						</ul>
					</li>
				</ul>
			</div>
		</div>
	</div>
	
	<?php foreach (glob("templates/*.tpl") as $file) { $name = str_replace(array("templates/",".tpl"),array("","_tpl"),$file); ?>
	<script id="<?php echo $name;?>" type="text/html">
	<?php echo file_get_contents($file);?>
	</script>
	<?php }?>

	<div id="content">
	</div>
	<div class="modal" id="loader" style="display:none">
		<div class="modal-body">
		<center>
			Подождите, идёт загрузка.
			<!--img src="http://images3.wikia.nocookie.net/__cb20090430142932/nonsensopedia/images/5/58/Rickroll.gif"-->
		</center>
	  </div>
	</div>
</body>
</html>
