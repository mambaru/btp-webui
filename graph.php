<?php

define('JPGRAPH_PATH', 'jpgraph_src');

include JPGRAPH_PATH."/jpgraph.php";
include JPGRAPH_PATH."/jpgraph_line.php";
include JPGRAPH_PATH."/jpgraph_date.php";
include "Json.php";
header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past

set_time_limit(30);
ini_set('memory_limit','1G');
//$method = $_REQUEST['method'];
$host = !empty($_REQUEST['host']) ? $_REQUEST['host'] : 'cdaemon13';//127.0.0.1';
$port = 22400;

$conn = new JsonRpc_Connection(array('host'=>$host,'port'=>$port));
$params = json_decode($_REQUEST['params'],true);
$items = json_decode($_REQUEST['items'],true);
$scale = intval($_REQUEST['scale']);
$slice = $_REQUEST['slice'];
$params['scale'] = $scale; 

$graph = new Graph(1440/3+50,250);
$graph->SetScale("datint");

/*$graph->img->SetAntiAliasing(false);
$graph->SetBox(false);

$graph->img->SetAntiAliasing();*/

//$graph->yaxis->HideZeroLabel();
//$graph->yaxis->HideLine(false);
//$graph->yaxis->HideTicks(false,false);

//$graph->yaxis->HideTicks(false,false);

$graph->SetMargin(50,0,0,20);

if (isset($_REQUEST['title'])) {
	$graph->title->Set($_REQUEST['title']);
} elseif (count($items)==1) {
	$graph->title->Set(implode(', ',$items[0])." ".$slice);
}

$graph->xgrid->Show();
$graph->xgrid->SetLineStyle("solid");
//$graph->xaxis->SetTickLabels(array('A','B','C','D'));
$graph->xgrid->SetColor('#E3E3E3');
if ($scale==60) {
	$graph->xaxis->scale->ticks->Set($scale*60*2);
	$graph->xaxis->scale->SetDateFormat('H:i');
} else {
	$graph->xaxis->scale->ticks->Set($scale*60*4);
}

$list = array();
foreach ($items as $prop) {
	$list[] = $conn->request('get_graph',$prop+$params);
}

function summize($data,$v) {
	$r = array();
	$s = 0; $c = 0;
	for ($i=0;$i<count($data);$i++) {
		$s = ($data[$i]===null)?null:$s+$data[$i];
		$c++;
		if ($c==$v) {
			$r[] = $s===null?null:$s/$v;
			$c = 0;
			$s = 0;
		}
	}
	if ($c!=0) die("FAIL");
//	echo $s.'x';exit;
	return $r;
}

$count = 1440;
$normscale = 1;
$normcount = $count/$normscale;
$divscale = ($slice=='count'?$scale:1000);

$plotcounts = 0;
foreach ($list as $item) {
	$data = $item->get();
	if (!$data['data']) continue;
	$nonz = 0;
	foreach ($data['data'] as $item) if ($item['count']!=0) {$nonz++; if ($nonz>=2) break;}
	if ($nonz<2) continue;
	
	$timedata = array_map(function($x) use($data,$scale,$normscale,$normcount) { return $data['ts']+($x-$normcount)*$scale*$normscale;},range(0,$normcount-1));

	$plotdata = array_slice($data['data'],count($data['data'])-$count*2-2,$count);
	$plotdata = array_map(function($x) use ($divscale,$slice) {return $x['count']?$x[$slice]/$divscale:null;}, $plotdata);
	//print_r($plotdata);
	$plotdata = summize($plotdata,$normscale);
	//print_r($plotdata);exit;
	$plot = new LinePlot($plotdata, $timedata);
	$graph->Add($plot);
	$plot->SetColor("#FFC8C8");

	$plotdata = array_slice($data['data'],count($data['data'])-$count-2, $count);
	$plotdata = array_map(function($x) use ($divscale,$slice) {return $x['count']?$x[$slice]/$divscale:null;}, $plotdata);
	$plotdata = summize($plotdata,$normscale);
	$plot = new LinePlot($plotdata, $timedata);
	$graph->Add($plot);
	$plot->SetColor("#5480E0");

//	$p1->SetLegend('Line 1');

	$plotcounts++;
}
if (!$plotcounts) {
	$plot = new LinePlot(array(0), array(0));
	$graph->Add($plot);
	$plot->SetColor("#5480E0");
}
//$graph->legend->SetFrameWeight(1);

// Output line
$graph->Stroke();

