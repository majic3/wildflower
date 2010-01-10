<?php
/**
 * Reigons Component
 * 
 */
class ReigonsComponent extends Object {
	
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
	private $reigonNamesArray = array();

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