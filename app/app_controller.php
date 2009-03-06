<?php
class AppController extends Controller {
	//public $components = array('DebugKit.Toolbar'); 

	function beforeFilter() {
		if(($this->action !== 'wf_jlm'))	{
			// debug_kit can not be used with DebugKit
			//App::import('Component', 'DebugKit.Toolbar');
		}
	}
}
