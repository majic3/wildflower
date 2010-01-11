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

		if($options)	{
			extract($options);
		}

		foreach($content as $index => $region)	{
			if($region['region'])	{
				$flag = true;
				$this->regionArray[$region['region']][] = $region['content'];
			} else {
				$this->regionArray['sidebar'][] = $region['content'];
			}
		}
	}
	
	/**
	 * Set Groups
	 *
	 * @param string $pageTitle Title of the current item/page/posts...
	 */
	function setGroups() {
		foreach($this->getNames() as $region => $r)	{
			$this->controller->set(
				$r . '_for_layout', 
				implode('', $this->regionArray[$r])
			);
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