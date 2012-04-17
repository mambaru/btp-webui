<div class="container-fluid" style="padding-right:0;padding-left:3px">
	<div class="row-fluid">
		<div class="span2" id="content-left"></div>
		<div id="content-right" style="padding-left:15px;margin-right:0;"></div>
	</div>
</div>
<script>
	(function(){
		var $win = $(window);
		/* ToDoDo */
		/* можно ли вынести сюда переменные/элементы $contentRight $formSearch $leftList , чтобы браузер их все время не искал при ресайзе */
		function onResize(){
			var winHeight = $(window).height();
			var $contentRight = $('#content-right');
			var $formSearch = $('.form-search');
			var $leftList = $('.js-left-list');
			if ($leftList.length) {
				$leftList.css('height',(winHeight- $leftList.offset().top- $formSearch.outerHeight())+"px");
			}
			$contentRight.css('height',( winHeight - $contentRight.offset().top )+"px");
		}
		$win.bind('resize',onResize);
		onResize();
	}());
</script>
