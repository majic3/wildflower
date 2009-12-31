<?php
/**
 * SEO Component
 * 
 */
class SeoComponent extends Object {
	
	/**
	 * Current controller
	 *
	 * @var AppController
	 */
	private $controller;
	
	function startup($controller) {
		$this->controller = $controller;
	}
	
	/**
	 * Build SEO title
	 *
	 * @param string $pageTitle Title of the current item/page/posts...
	 */
	function title($pageTitle = null) {
		if (!is_object($this->controller)) {
			return;
		}
		
		if (!$pageTitle) {
		   $pageTitle = $this->controller->pageTitle;
		}
		if (!$pageTitle) {
		   $pageTitle = ucwords($this->controller->params['controller']);
		}
		
		$description = hsc(Configure::read('Wildflower.settings.description'));
		$keywords = hsc(Configure::read('Wildflower.settings.keywords'));
		$nameAndDescription = hsc(Configure::read('Wildflower.settings.site_name'));
		if ($description) {
			$nameAndDescription = "$nameAndDescription - {$description}";
		}

		if ($this->controller->isHome) {
			$this->controller->pageTitle = $nameAndDescription;
		} else {
			$this->controller->pageTitle = "$pageTitle &#8226; $nameAndDescription";
		}
	}
	
}
