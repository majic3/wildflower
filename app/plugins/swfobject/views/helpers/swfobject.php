<?php 
/**
 * A helper for managing instances of flash within cake views
 * 
 *   http://code.google.com/p/swfobject/
 *
 * Instructions for use
 * 
 * @author Majic3
 * @license MIT
 * @version 0.12
 * @modified 03/10/2009
 * 
 * Based inpart on the flashHelper by 
 * @author Alexander Morland
 * @license MIT
 * @version 1.3
 * @modified 28. nov. 2008
 */
class Swfobjecthelper extends AppHelper	{
	public $helpers = array('Javascript');
	//public $google = array('Javascript');

	/**
	 * Used for remembering options from init() to each renderSwf
	 *
	 * @var array
	 */
	private $options = array(
		'width' => 100,
		'height' => 100
	);

	// the default settings of objects (needs some clarification; simplification perhaps should only be settings/options not the both)
	private $settings = array(
		'instance' => array(
			'width' => 100,
			'height' => 100
		),
		'head' => array()
	);

	
	/**
	 * instaces created be helper (why I have two var almost akin [refactor])
	 *
	 * @var array
	 */
	private $instances = array();

	/**
	 * instances
	 *
	 * @var mixed
	 */
	private $tInstances = false;

	/**
	 * The default version of flash to be inserted
	 *
	 * @var string
	 */
	private $defaultVersionRequirement = '9.0.0';
	
	/**
	 * Used by renderSwf to only call init if it hasnt been done, either
	 * manually or automatically by a former renderSwf()
	 *
	 * @var boolean
	 */
	private $initialized = false;
	
	/**
	 * Used internally to concat the script states
	 *
	 * @var string
	 */
	private $_init_script = '';
	
	/**
	 * Set this to false to not automatically add swfobject init calls as a script block to the scripts for layout view var
	 *
	 * @var boolean
	 */
	public $autoHead = true;

	
	/**
	 * when true the helper includes the swfobject script from google code
	 *
	 * @var mixed - set to false  to not use and use your own copy iin
	 */
	public $script = 'http://ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js';
	
	/**
	 * Contructs helper and gathers instances to be managed as defined in beforeRender 
	 *
	 * @var array of options
	 */
	public function __construct($options = array()) {
		//$this->log('init', 'swfobject-helper');
		if (!empty($options)) {
			$this->options = am($this->options, $options);
		}
		$this->initialized = true;
		$view =& ClassRegistry::getObject('view'); 
		if (is_object($view)) {
			if(array_key_exists('swfobjects', $view->viewVars))	{
				$this->tInstances = $view->viewVars['swfobjects'];
			}
			return true;
		}
	}
	
	/**
	 * dynamicObject
	 * Wrapper for the SwfObject::embedSWF method in the vendor. This method will write a javascript code
	 * block that calls that javascript method. If given a dom id as fourth parameter the flash will 
	 * replace that dom object. If false is given, a div will be placed at the point in the 
	 * page that this method is echo'ed. The last parameter is mainly used for sending in extra settings to
	 * the embedding code, like parameters and attributes. It may also send in flashvars to the flash. 
	 * 
	 * For doucumentation on what options can be sent, look here:
	 * http://code.google.com/p/swfobject/wiki/documentation
	 * @return string
	 */
	private function dynamicObject($swfFile, $width = null, $height = null, $divDomId = false, $options = array()) {
	$this->log('dynamicObject', 'swfobject-helper');
		$options = am ($this->options, $options);		
		if (is_null($width)) {
			$width = $options['width'];
		}
		if (is_null($height)) {
			$height = $options['height'];
		}
		$ret = '';
		if (!$this->initialized) {
			$init = $this->init($options);
			if (is_string($init)) {
				$ret = $init;
			}
			$this->initialized = true;
		}		
		$flashvars = '{}';
		$params =  '{wmode : "window"}';
		$attribs = '{}';
		if (isset($options['flashvars'])) {
			$flashvars = $this->Javascript->object($options['flashvars']);
		}
		if (isset($options['params'])) {
			$params = $this->Javascript->object($options['params']);
		}
		if (isset($options['attribs'])) {
			$attribs = $this->Javascript->object($options['attribs']);
		}

		if (isset($options['version'])) {
			$version = $options['version'];
		} else {
			$version = $this->defaultVersionRequirement;
		}
		if (isset($options['install'])) {
			$install = '"'.$options['install'].'"';
		} else {
			$install =  false;
		}
		if (isset($options['callback'])) {
			$callback = $options['callback'];
		} else {
			$callback =  false;
		}
		
		$swfLocation = $this->webroot.'swf/' .$swfFile;

		/*
			var flashvars = {};
			flashvars.testingvar = "some new value";
			var params = {};
			params.menu = "false";
			params.scale = "noscale";
			params.wmode = "transparent";
			params.bgcolor = "555555";
			params.base = "./";
			var attributes = {};
			attributes.id = "myFlashContent";
			attributes.name = "myName";
			attributes.styleclass = "newClass";
			swfobject.embedSWF("test.swf", "myContent", "300", "150", "9.0.0", false, flashvars, params, attributes);	*/

		$this->_init_script.= "\n\n" . 'swfobject.embedSWF("'.$swfLocation.'", "'.$divDomId.'", "'.$width.'", "'.$height.'", "'.$version.'",'.($install ? $install : 'null').', '.$flashvars.', '.$params.', '.$attribs.', '.($callback ? $callback : 'null').');';
	}

	/**
	 * debugObjects
	 *
	 *  renders the code for a static swfobject object
	 *
	 * @return void
	 * @access public
	 */
	public function debugObjects() {
		debug($this->instances);
	}

	/**
	 * staticObject
	 *
	 *  renders the code for a static swfobject object
	 *
	 * @return void
	 * @access public
	 */
	public function staticObject($ObjectId, $altContent = false) {
		// use the static element
		$View = &ClassRegistry::getObject('view'); 
		
		//$this->log('staticObject', 'swfobject-helper');
		$staticArray = Set::extract($this->instances, 'Static.{n}.'. $ObjectId);
		
		// debug($staticArray);die();
		$returnArray['plugin'] = 'Swfobject';
		$returnArray['id'] = $ObjectId;
		$returnArray['width'] = $staticArray[0]['width'];
		$returnArray['height'] = $staticArray[0]['height'];
		$returnArray['altContent'] = ($altContent) ? $altContent : '';
		$returnArray['file'] = $this->webroot.'swf/' .$staticArray[0]['file'];
		$returnArray['class'] = (array_key_exists('class', $staticArray[0])) ? $staticArray[0]['class'] : 'flash';
		$returnArray['params'] = (array_key_exists('params', $staticArray[0])) ? $staticArray[0]['params'] : array();
		$returnArray['attribs'] = (array_key_exists('attribs', $staticArray[0])) ? $staticArray[0]['attribs'] : array();
		return $View->element('static',$returnArray);
	}

	/**
	 * registers a swfObject you then get the static code in your helper $swfobject->staticObject($ObjectId);
	 *
	 *  renders the code for a static swfobject object
	 *
	 * @return void
	 * @access public
	 */
	private function registerObject($ObjectId, $options, $type = 'static') {
		if($type == 'static')	{
			$this->_init_script.= "\n// register object number \nswfobject.registerObject(\"$ObjectId\", \"{$options['version']}\");";
		} else	{
			$this->_init_script.= "\n// call embedding of object number \n" . $this->dynamicObject($options['file'], $options['width'], $options['height'],$ObjectId, $options);
		}
		$this->instances[ucfirst($type)][] = array($ObjectId => $options);
	}

	/**
	 * getInitScript
	 *
	 *  plan to customise to bundle auto laoded scripts as a additional combined asset in asset plugin - perhaps if added to the plugin and used by and from within the asset helper of the plugin
	 *
	 * @return void
	 * @access public
	 */
	public function getInitScript() {
		return $this->_init_script;
	}


	/**
	 * After Layout callback
	 *
	 *  might not be of any use to this helper
	 *
	 * @return void
	 * @access public
	 */
	public function afterLayout() {
	}

	public function beforeRender() {
		
		$view =& ClassRegistry::getObject('view'); 
		//debug($this); echo "<br />";
		//debug($view);die();
		$this->log('beforeRender', 'swfobject-helper');
		if($this->script) {
			//$this->log('beforeRender -} googleScript is set ' . $this->googleScript, 'swfobject-helper');
			$this->Javascript->link($this->script, false);
		} else {
			//$this->log('beforeRender -} googleScript is not set ', 'swfobject-helper');
		}
		extract($this->settings);

		if($this->tInstances)	{
			foreach($this->tInstances as $obj)	{
				$this->log($obj, 'swfobject-helper');
				$options['type'] = $obj->type;
				$options['file'] = $obj->file;
				$options['width'] = $obj->width;
				$options['height'] = $obj->height;
				$options['divDomId'] = $obj->divDomId;
				$options['flashvars'] = (isset($obj->options->fvars))? $obj->options->fvars : false;
				$options['params'] = (isset($obj->options->params))? $obj->options->params : false;
				$options['attribs'] = (isset($obj->options->attribs))? $obj->options->attribs : false;
				$options['callback'] = (isset($obj->options->callback))? $obj->options->callback : false;
				$options['version'] = $this->defaultVersionRequirement; // ($obj->version) ? $obj->version : 
				$options = am($this->options, $options);
				//$this->log('registering a swfobject of #ID with #OPTIONS its a #TYPE', 'swfobject-helper');
				$this->log($options, 'swfobject-helper');
				$this->registerObject($obj->divDomId, $options, $options['type']);
			}
			$this->_autoHead();
		}
		//parent::beforeRender();
	}
	
	/*
	 * After Render Callback
	 *
	 *  might not be of any use to this helper
	 *
	 * @return void
	 * @access public

	*/
	public function afterRender() {
	}
	
	/*
	 * headscript
	 *
	 *  returns the headscript as a block by defaut or just the script for you to insert in a block.
	 *  allowing you to have cleaner output
	 *
	 * @return void
	 * @access public

	*/
	public function headscript($block = true) {
		return ($block === true) ? $this->Javascript->codeblock($this->_init_script, Array('inline' => true)) : $this->_init_script;
	}
	
	/*
	 * headscript
	 *
	 *  returns the headscript as a block by defaut or just the script for you to insert in a block.
	 *  allowing you to have cleaner output
	 *
	 * @return void
	 * @access private

	*/
	private function _autoHead() {
		if($this->autoHead)
			$this->Javascript->codeblock($this->_init_script, Array('inline' => false));
	}
}