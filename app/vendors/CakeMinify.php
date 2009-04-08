<?php
/*
	This script is to minify Styleheets using Steve Clay & Ryna Groves Minify.
	This script is based on Florian Schmitz CSSPP Filter for CakePHP
	This script has been Created by Sam Sherlock based on the work of the aforementioned
*/
/* This PHP Script has been created by Florian Schmitz (floele at gmail dot com) 2005
 * It is licensed under the following Creative Commons License:
 * http://creativecommons.org/licenses/by-nc/2.0/
 */
 ini_set('include_path', APP  . DS . 'vendors' . DS . 'Minify' . DS . PATH_SEPARATOR . ini_get('include_path'));

// die(ini_get('include_path'));
 require_once('Minify/Source.php');
 require_once('Minify/Cache/File.php');	
 require_once('Minify/Controller/Base.php');
 require_once('Minify/Controller/MinApp.php');
 require_once('Minify/HTTP/ConditionalGet.php');
 require_once('Minify/HTTP/Encoder.php');
 require_once('Minify/Minify.php');

class CakeMinify	{
	public $files = Array();
	protected $Minify = null;
	protected $Cache = null;
	protected $LastModified = null;
	protected $Type = null;

	public function __construct($cache, $type)	{
		$this->Minify = new Minify();
		$this->Cache = $cache;
		$this->Type = $type;
	}

	public function getModified()	{
	$cg = new HTTP_ConditionalGet(array(
		'lastUpdateTime' => max($this->files)
	));
		return $cg->check();
	}

	public function process()	{
		$this->Minify->setCache($this->Cache);

		foreach($this->files as $k => $f)	{
			// check if file is modified
			$this->files[$k] = (($this->Type == 'js') ? 'js/' : 'css/') . $f;
		}
		return $this->Minify->combine($this->files);
	}
}
?>