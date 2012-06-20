<?php

define('JPGRAPH_PATH', 'jpgraph');
error_reporting(E_ALL & (!E_STRICT)); //jpgraph produces error in E_STRICT

include JPGRAPH_PATH."/jpgraph.php";
include JPGRAPH_PATH."/jpgraph_line.php";
include JPGRAPH_PATH."/jpgraph_date.php";
include "Json.php";
include 'graph_cache.php';
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
$normalization = !empty($_REQUEST['normalization']);


function summize($data,$v) {
	$r = array();
	$c = 0; $ss = array();
	for ($i=0;$i<count($data);$i++) {
        if ($data[$i] != null) {
            $ss[] = $data[$i];
        }
		$c++;
		if ($c==$v) {
			$r[] = empty($ss) ? null : array_sum($ss)/count($ss);
			$c = 0;
            $ss = array();
		}
	}
	if ($c!=0) die("FAIL");
	return $r;
}


//прореживание
$count = 1440;
$normscale = empty($_REQUEST['normscale']) ? 1 : intval($_REQUEST['normscale']);
$normcount = $count/$normscale;
$divscale = ($slice=='count'?$scale:1000);

if (!empty($_REQUEST['width']) && !empty($_REQUEST['height'])) {
    $width = intval($_REQUEST['width']);
    $height = intval($_REQUEST['height']);
} else {
    $width = 1440/3+50;
    $height = 250;
}

// проверяем кэш
$Cache = new Graph_Cache(array(
    'params' => $params, 'items' => $items, 'scale' => $scale, 'slice' => $slice, 'host' => $host, 
    'width' => $width, 'height' => $height, 'normscale' => $normscale
));
$Cache->setTTL($scale*$normscale);
if (empty($_REQUEST['nocache']) && $Cache->check()) {
    $Cache->output();
    exit;
}


//сделать нужные запросы
$qlist = array();
foreach ($items as $prop) {
	$qlist[] = array(implode('',$prop), $conn->request('get_graph', $prop+$params)->get());
}

$ts = 0;
$sum_data = array();
$list = array();
foreach ($qlist as $lk=>$pair) {
	list($key, $data) = $pair;
	if (!$data['data']) continue;
	
	$nonz = 0;
	foreach ($data['data'] as $item) if ($item['count']!=0) {$nonz++; if ($nonz>=2) break;}
	if ($nonz<2) continue;

	$ts = $data['ts'];

	$plotdata = array_map(function($x) use ($divscale,$slice) {return $x['count']?$x[$slice]/$divscale:null;}, $data['data']);
	$plotdata = summize($plotdata, $normscale);
	
	foreach ($plotdata as $k=>$v) $sum_data[$k] = (isset($sum_data[$k])?$sum_data[$k]:0) + $v;
	$list[] = array($key, $plotdata);
	
}
$timedata = array_map(function($x) use($ts,$scale,$normscale,$normcount) { return $ts+($x-$normcount)*$scale*$normscale;},range(0,$normcount-1));

function normalize(array $plotdata, array $sum_data)
{
    foreach ($plotdata as $k => $v) {
        $plotdata[$k] = $sum_data[$k] ? 100*$plotdata[$k]/$sum_data[$k] : null;
    }
    return $plotdata;
}

if ($normalization)
{
    $list = array_map(function($pair) use ($sum_data) {
        $pair[1] = normalize($pair[1], $sum_data);
        return $pair;
    }, $list);
}

function isEmptyData(array $data) {
    return count(array_filter($data)) == 0;
}

if (count($list) > 1)
{
    $list = array_map(function($item) use ($normcount) {
        $item[1] = array_slice($item[1], count($item[1])-$normcount*2-2, $normcount);
        return $item;
    }, $list);
    $list = array_filter($list, function($item) {
        return !isEmptyData($item[1]);
    });
}

$height += ceil(count($list)/2)*20;
$graph = new Graph($width, $height);
$graph->SetScale("datlin");
$graph->SetTheme(new FixedTheme());
$graph->SetMargin(45, 5, 25, 25);

if (isset($_REQUEST['title'])) {
    $graph->title->Set($_REQUEST['title']);
} elseif (count($items)==1) {
    $graph->title->Set(implode(', ',$items[0])." ".$slice);
}

$graph->xgrid->Show();
$graph->xgrid->SetLineStyle("solid");

$graph->xgrid->SetColor('#E3E3E3');
if ($scale==60) {
    $graph->xaxis->scale->ticks->Set($scale*60*2);
    $graph->xaxis->scale->SetDateFormat('H:i');
} else {
    $graph->xaxis->scale->ticks->Set($scale*60*4);
}


$plotcounts = 0;

if (count($list) == 1)
{
    list($key, $plotdata) = reset($list);
    
    $dataset = array(
        '#FFC8C8' => array_slice($plotdata, count($plotdata)-$normcount*2-2, $normcount),
        '#5480E0' => array_slice($plotdata, count($plotdata)-$normcount-2, $normcount),
    );
    
    foreach ($dataset as $color => $data)
    {
        if (isEmptyData($data)) {
            continue;
        }
        $plot = new LinePlot($data, $timedata);
        $graph->Add($plot);
        $plot->SetColor($color);
        $plotcounts++;
    }
}
else
{
    foreach ($list as $pair)
    {
        list($key, $plotdata) = $pair;
        
        $plot = new LinePlot($plotdata, $timedata);
        $graph->Add($plot);
        $plot->SetLegend($key.' ('.round(max($tmp),2).' / '.round(end($tmp),2).')');
    
        $plotcounts++;
    }
}

if (!$plotcounts) {
	$plot = new LinePlot(array(0), array(0));
	$graph->Add($plot);
	$plot->SetColor("#5480E0");
}

$graph->Stroke($Cache->getFilename());
$Cache->output();
