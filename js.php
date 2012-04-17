<?php
include "Json.php";
set_time_limit(30);
ini_set('memory_limit','1G');
$method = $_REQUEST['method'];
$params = $_REQUEST['params'];
$host = !empty($_REQUEST['host']) ? $_REQUEST['host'] : '127.0.0.1';
$port = 22400;
$conn = new JsonRpc_Connection(array('host'=>$host,'port'=>$port));
$res = $conn->request($method,json_decode($params,true))->get();

$data = json_encode($res);

//ob_start("ob_gzhandler"); 
//ini_set('zlib.output_compression',true);
//ini_set('zlib.output_compression_level',5);

header("Expires: Mon, 26 Jul 1997 05:00:00 GMT"); // Datum aus Vergangenheit
header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT"); 
header("Cache-Control: no-store, no-cache, must-revalidate"); 
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

header('Content-Type: text/x-json; charset=utf-8');
header('Content-Length: '.strlen($data));
echo $data;
