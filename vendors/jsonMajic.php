<?php

class jsonMajic	{

	static $_errorCodes = array(
		JSON_ERROR_NONE => 'No error has occurred',
		JSON_ERROR_DEPTH => 'The maximum stack depth has been exceeded',
		JSON_ERROR_CTRL_CHAR => 'Control character error, possibly incorrectly encoded',
		JSON_ERROR_SYNTAX => 'Syntax error',
	);
	private $err = array();
	public $input = null;
	public $output = array();

	public function encode_array()	{
		return jsonMajic::encode($this->output);
	}

	public function decode_str()	{
		return jsonMajic::decode($this->input);
	}

	public function hasError()	{
		return false;
	}

	// decode $str 
	static function decode($str)	{
		$str = substr($str, 1, strlen($str) - 2); // remove outer ( and ) 
		$str = preg_replace("/([a-zA-Z0-9_]+?):/" , "\"$1\":", $str); // fix variable names 

		$output = json_decode($str, true); 
		return $output; 
	}

	// encode $obj
	static function encode($obj)	{
		$output = json_encode($obj, true); 
		return '('.$output .')'; 
	}

	// @todo errors
	static function error()	{
		$r = false;
		return $r;
	}
}


?>