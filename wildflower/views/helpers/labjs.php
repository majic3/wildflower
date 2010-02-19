<?php
/**
 * labJS Helper
 *
 * Converts Javascript Output to use labJS Setup within Wildflower - 
 * Loading & Blocking JS see Kyle Getify's labJS on github.com
 *
 * @copyright   Copyright 2010 Sam Majic3
 * @link        http://github.com/majic3/wildflower 
 * @package     labJS
 * @subpackage  caketime.views.helpers
 * @author      Sam, Majic3
 * @license     http://www.opensource.org/licenses/mit-license.php The MIT License
 */
class LabjsHelper extends AppHelper {


	public $helpers = array('Javascript');

	/**
	 * inits
	 *
	 * array of script blocks to be used in labJS .wait() after .script()
	 * this array is associative by a md5 of the javascript to be used
	 * so when
	 *
	 * @var array
	 * @access priavte
	 */
	private $inits = array();

	/**
	 * View
	 *
	 * used to get the set scripts for view
	 *
	 * @var mixed
	 * @access priavte
	 */
	private $__viewScripts = null;

	/**
	 * Options
	 *
	 * path => Path from which the controller/action file path will be built
	 *         from. This is relative to the 'WWW_ROOT/js' directory
	 *
	 * @var array
	 * @access private
	 */
	private $__options = array(
		'baseLib' => array(
			'http://ajax.googleapis.com/ajax/libs/jquery/1.4.1/jquery.min.js'
		),
		'labJS' => array(
			'LAB'
		)
	);

	/**
	 * wait
	 *
	 * array of wait codeblocks
	 *
	 * @var array
	 * @access private
	 */
	private $__wait = array();

	/**
	 * Object constructor
	 *
	 * Allows passing in options to change class behavior
	 *
	 * @param string $options Key value array of options
	 * @access public
	 */
	public function __construct($options = array()) {
		$this->__options = am($this->__options, $options);
		$this->__viewScripts = &ClassRegistry::getObject('view')->__scripts;
	}

	public function beforeRender() {
	}

	public function addScript($javascriptFile) {
	}

	public function hashScript($javascriptFile) {
		$token = str_replace(
				'.js', 
				'', 
				basename($javascriptFile)
			);
		return $token;
		//return md5();
	}

	public function addWait($javascriptFile, $script, $overwrite = false) {
		$hash = $this->hashScript($javascriptFile);
		if($overwrite or !isset($this->__wait[$hash]))	{
			$this->__wait[$hash] = $script;
		} else 	{
			$this->__wait[$hash].= $script;
		}
	}

	public function hasWait($javascriptFile) {
		$hash = $this->hashScript($javascriptFile);
		return (isset($this->__wait[$hash])) ? $this->__wait[$hash] : false;
	}

	/*
	 * 
		<script src="/js/LAB.js" type="text/javascript"></script>
		<script type="text/javascript">
			$LAB
				.script("http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js").wait(function ()	{
					$('#umsg').removeClass('alert').addClass('notice').html('preparing page');
				})
				.script("/js/common.js").wait(function ()	{
					init();
				}).wait(function()	{
					var $umsg = $('#umsg');
					if($umsg.hasClass('success')) $umsg.fadeOut('slow').remove();
				});
		</script>
	 */
	public function output($endWait = false) {

		$LAB = '$LAB';

		$viewScripts = array();

		$scripts = $this->__options['baseLib'];

		//debug($this->View);

		foreach ($this->__viewScripts as $i => $script) {
			if (preg_match('/(src)="\/?(.*\/)?(js)\/(.*).(js)"/', $script, $match)) {
				$this->log($match, 'labJS');
				$prefix = ($match[2] != '') ? '/' . $match[2] : '/';
				$scripts[] = $prefix . $match[3] . '/' . $match[4] .  '.' . $match[5];
			}
		}

		foreach($scripts as $libs)	{
			//$this->log($libs, 'labJS');
			$wait = $this->hasWait($libs);

			$LAB.= "\n\t" . '.script("'.$libs.'")';

			if($wait)	{
				$LAB.= '.wait(function() {' . "\n\t\t".$wait."\n\t\t" . '})';
			}
		}

		if($endWait)	{
			$LAB.= '.wait(function() {' . "\n\t\t".$endWait."\n\t\t" . '})';
		}

		$LAB.= ';';

		$labJS = '';
		$labJS.= $this->Javascript->link($this->__options['labJS']);
		$labJS.= "\n" . $this->Javascript->codeBlock($LAB, array(
			'inline' => true,
			'safe' => true
		));
		return $labJS;
	}
}