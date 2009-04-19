<?php
class WildDashboardsController extends AppController {
	
	public $helpers = array('List', 'Time', 'Text');
	public $pageTitle = 'Dashboard';
	
	function wf_index() {
        $items = $this->WildDashboard->findRecentHappening();

		//debug($items);//die();
		$dashClasses = WildDashboard::$classNames;
		$dashItems = array();
		foreach($dashClasses as $name => $model)	{
			$dashItems[$name] = Set::extract("/{$name}", $items);
		}
		//debug($dashItems);	die();

		$this->set(compact('dashItems', 'dashClasses'));
	}
	
    /**
     * Admin page and post search
     *
     * @param string $query Search term, encoded by Javascript's encodeURI()
     */
    function wf_search($query = '') {
        $query = urldecode($query);
        $postResults = ClassRegistry::init('WildPost')->doSearch($query);
        $pageResults = ClassRegistry::init('WildPage')->doSearch($query);
        $results = am($postResults, $pageResults);
        $this->set('results', $results);
    }

	/**
	* Public search @TODO
	*
	*/
	function search() {
		if (!empty($this->data)) {
			$query = '';
			if (isset($this->data['Search']['query'])) {
				$query = $this->data['Search']['query'];
			} else if (isset($this->data['Dashboard']['query'])) {
				$query = $this->data['Dashboard']['query'];
			} else {
				return;
			}

			$postResults = ClassRegistry::init('WildPost')->doSearch($query);
			$pageResults = ClassRegistry::init('WildPage')->doSearch($query);

			if (!is_array($postResults)) {
				$postResults = array();
			}
			if (!is_array($pageResults)) {
				$pageResults = array();
			}
			$results = array_merge($postResults, $pageResults);
			$this->set('results', $results);

			if ($this->RequestHandler->isAjax()) {
				$this->render('/elements/search_results');
			}
		}
	}
}
