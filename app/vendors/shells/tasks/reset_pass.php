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
App::import(array('Model', 'AppModel', 'Shell', 'File', 'Security'));
require_once(APP . DS . 'config' . DS . 'wf_core.php');

/**
 * undocumented class
 *
 * @package default
 */
class ResetPassTask extends Shell {
	//public $uses = array('WildUser');

/**
 * reset pass for user by id or login
 * updates the db too
 *
 * @return void
 * @access public
 */
	function execute() {
		//$this->out(json_encode($this->WildUser));die();
		$user = false;
        $action = trim($this->args[0]);
        $pass = trim($this->args[1]);
        $uid = trim($this->args[2]);

		$this->out("action:		" . $action);
		$this->out("uid:		" . $uid);
		$this->out("password:	" . $pass);

		$bytype = is_numeric($uid) ? 'Id' : 'Login';
		$epass = '';
		$epass = Security::hash($pass, 'sha1', true);

		$this->out("encoded pass:		" . $epass);
		$this->out("user identifier:	" . $uid);
		$this->out("bytype:				" . $bytype);

		if($bytype == 'Id')	{
			App::Import('Model', 'User');
			ClassRegistry::init('User')->recursive = -1;
			$user = ClassRegistry::init('User')->findById($uid);
		} else {
			ClassRegistry::init('User')->recursive = -1;
			$user = ClassRegistry::init('User')->findByLogin($uid);
		}

		$this->out(json_encode($user));
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