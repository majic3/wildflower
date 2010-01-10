<?php
/**
 * Reigons Component
 * 
 */
class RegionsComponent extends Object {
	
	/**
	 * Current controller
	 *
	 * @var AppController
	 */
	private $controller;
	
	/**
	 * Current controller
	 *
	 * @var array
	 */
	private $reigonNamesArray = array(
		'sidebar' => false
	);

	function startup($controller) {
		$this->controller = $controller;
	}
	
	/**
	 * Build Groups
	 *
	 * @param string $pageTitle Title of the current item/page/posts...
	 */
	function buidlGroups() {
		if (!is_object($this->controller)) {
			return;
		}

		//foreach()	{
			$this->reigonNamesArray[] = 'reigon';
			$this->controller->set('reigon_for_layout', '<p>my reigon</p>');
		//}
	}
	
	/**
	 * Get Reigon Names
	 *
	 * @param string $pageTitle Title of the current item/page/posts...
	 */
	function getNames() {
		if ($this->reigonNamesArray == array()) {
			return false;
		}

		return $this->reigonNamesArray;
	}
	
}