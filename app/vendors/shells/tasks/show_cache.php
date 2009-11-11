<?php
/* SVN FILE: $Id$ */
/**
 * Cache Shell
 *
 * Long description for file
 *
 * PHP version 5
 *
 * Licensed under The MIT License
 *
 * @filesource
 * @package		  cache
 * @subpackage	  cache.shells
 * @version       $Revision$
 * @modifiedby    $LastChangedBy$
 * @lastmodified  $Date$
 * @license       http://www.opensource.org/licenses/mit-license.php The MIT License
 */
App::import('Core', array('Shell'));
require_once(APP . DS . 'config' . DS . 'wf_core.php');

/**
 * undocumented class
 *
 * @package default
 */
class ShowCacheTask extends Shell {

/**
 * Files/aliases to be stripped from listing results
 *
 * @var array
 * @access protected
 */
	var $_special = array('.', '..');
	

/**
 * Show cached file list
 * Actual outputting of file list is delegated to CacheShell::_output
 *
 * @return void
 * @access public
 */
	function execute() {
		if (count($this->args) == 0) return $this->help();

		$options  = array_merge(array('type' => 'all'), $this->params);
		$directory = APP . WEBROOT_DIR . DS;

		$type = (($this->args[0] === 'all') || ($this->args[0] === 'jlm') || ($this->args[0] === 'rpages') || ($this->args[0] === 'scache')) ? $this->args[0] : $this->args;

		$scache = APP . WEBROOT_DIR . DS . 'cache';
		$rpages = APP . 'tmp' . DS . 'cache' . DS . 'wf_root_pages';
		$rpages = APP . 'tmp' . DS . 'cache' . DS . 'wf_root_pages';

		if($type == 'jlm' || $type == 'static')	{
			$files = am(glob($wdir . Configure::read('Asset.'.$type.'Path') . DS . '*'));		
		} elseif($type == 'all') {
			$files = am(
					glob($wdir . Configure::read('Asset.cssPath') . DS . '*'),
					glob($wdir . Configure::read('Asset.jsPath') . DS . '*')
				);
		} else {
			$files = $type;
			$type = 'Listed files: ';
		}

		$this->out(ucfirst($type));

		$this->_output($files);
	}

/**
 * 
 *
 * @param string $files
 * @return void
 * @access protected
 */
	function _output($files) {
		$fileCount = count($files);
		
		if ($fileCount === 0) {
			$this->out(__('No files exist in specified directory.'));
			return true;
		}
		
		$this->out(String::insert(__(':N Cached Files: ', true), array('N' => count($files))));
		foreach ($files as $file) {
			$file = str_replace(APP . WEBROOT_DIR . DS, '', $file);
			$this->out(String::insert("\t:file", compact('file')));
		}
	}


/**
 * Helper callback to remove invalid cache file names
 *
 * @return boolean True if file is not in $_special array, false otherwise.
 * @access protected
 */
	function _filter($file) {
		return (!in_array($file, $this->_special, true));
	}
	
/**
 * Help for Cache shell
 *
 * @return void
 * @access public
 */
		function help() {
			$this->out(__("Cache Shell", true));
			$this->out("");
			$this->out(__("\tAllows you to perform list and clear operations on your application caches", true));
			$this->out("");
			$this->out(__("\tUsage:", true));
			$this->out(__("\t\tcake cache show  [-type name]"));
			$this->out("");
			$this->out(__("\tArguments:", true));
			$this->out(__("\t\tshow: \tOutputs an alphanumerically ordered list of cache keys.", true));
			$this->out("");
			$this->hr();
			$this->out("");
		}
	
}

?>