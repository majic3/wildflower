<?php
//*
class LabjsCallback	 extends object	{
	public function initialize(&$controller)	{}

	public function beforeFilter(&$controller)	{}

	public function beforeRender(&$controller)	{
		// $controller->log('beforeRender callback of helper plugin', 'labJS');
	}

	public function shutdown(&$controller)	{}

	public function beforeRedirect(&$controller, $url, $status = null, $exit = true)	{}
} //*/

