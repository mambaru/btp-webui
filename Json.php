<?php
class JsonRpc_Future {
	public $data;
	public $failed = false;
	public $func;
	public function get() {
		if ($this->func) {
			$this->failed = true;
			call_user_func($this->func);
			$this->func = null;
		}
		return $this->data;
	}
	public function onReady($data) {
		$this->data = $data;
		$this->failed = false;
	}
}
class JsonRpc_Connection {
	protected $socket = null;
	protected $server = null;
	protected $failed = false;
	protected $id = 0;
	protected $onRecv = array();
	protected $onNotify = null;
	public function __construct($srv) {
		$this->server = $srv;
	}
	public function __destruct() {
		if ($this->socket) fclose($this->socket);
	}
	public function connect() {
		if ($this->socket) return $this;
		if ($this->failed) return $this;
		$this->socket = fsockopen($this->server['host'],$this->server['port']);
		$this->id = 0;
		$this->onRecv = array();
		if (!$this->socket) {
			$this->failed = true;
		}
		return $this;
	}
	protected function send($data) {
		if (!fwrite($this->socket,json_encode($data)."\r\n")) $this->throwEx('fwrite failed');
	}
	public function notify($method,$params) {
		if ($this->connect()->failed) return $this;
		$data = array('jsonrpc'=>'2.0','method'=>$method,'params'=>$params);
		$this->send($data);
		return $this;
	}
	public function failed() {
		return $this->failed;
	}
	public function requestCallback($method,$params,$onRecv) {
		if ($this->connect()->failed) return $this;
		$id = $this->id++;
		$this->onRecv[$id] = $onRecv;
		$data = array('jsonrpc'=>'2.0','method'=>$method,'id'=>$id,'params'=>$params);
		$this->send($data);
		return $this;
	}
	public function request($method,$params) {
		$F = new JsonRpc_Future();
		$F->func = array($this,'process');
		$this->requestCallback($method,$params,array($F,'onReady'));
		return $F;
	}
	protected function throwEx($data) {
		@fclose($this->socket);
		$this->socket = null;
		throw new Exception(print_r($data,true));
	}
	public function registerOnNotifyCallback($callback) {
		$this->onNotify = $callback;
	}

	public function process($force = false) {
		if ($this->connect()->failed) return array();
		$result = array();
		while ($force || count($this->onRecv)>0) {
			$data = fgets($this->socket);
			if (!$data) $this->throwEx('no data recieved');
			//echo $data."\n";
			$data = json_decode($data,true);
			if (isset($data['error'])) $this->throwEx($data['error']);
			if (!isset($data['id'])) {
				if ($this->onNotify) {
					$f = $this->onNotify;
					$f($data['method'],$data['params']);
					continue;
				}
				$this->throwEx('id not found');
			}
			if (!isset($this->onRecv[$data['id']])) $this->throwEx('invalid data recieved');

			call_user_func($this->onRecv[$data['id']], $data['result'],$data['id']);
			unset($this->onRecv[$data['id']]);
		}
		return $this;
	}
}

