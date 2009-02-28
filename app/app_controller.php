<?php
class AppController extends Controller {
	public $components = array('DebugKit.Toolbar');
    //public $view = 'Theme';
    //public $theme = 'wildflower'; 

	function beforeFilter() {
		if($this->action !== 'jlm')	{
			App::import('Component', 'DebugKit.Toolbar'); 
	}
	}
}
