<?php
//*
class SitemapCallback extends object	{

	public function initialize(&$controller)	{}

	public function beforeFilter(&$controller)	{}

	public function beforeRender(&$controller)	{
		// debug($controller->name == 'Sitemaps');
		if($controller->name == 'Sitemaps')	{
			$controller->prepareSitemap();
			$controller->set('styles', array('/sitemap/css/sitemap'));
		}
	}

	public function shutdown(&$controller)	{}

	public function beforeRedirect(&$controller, $url, $status = null, $exit = true)	{}
} //*/

