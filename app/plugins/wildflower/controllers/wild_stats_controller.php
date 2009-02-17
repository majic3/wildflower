<?php
class WildStatsController extends WildflowerAppController {	
	public $helpers = array('Cache', 'Wildflower.List', 'Wildflower.Navigation', 'Wildflower.Tree', 'Time');
	/** Pagination options for the wf_index action **/
    public $paginate = array(
        'limit' => 10,
        'order' => array('WildStat.created' => 'desc'),
    );

    function wf_index() {	
    	$WildStats = $this->paginate($this->modelClass);
        $this->set('WildStats', $WildStats);
    } 

    function wf_view($id) {
    	$WildStat = $this->WildStat->findById($id);
        $this->set('WildStat', $WildStats);
    } 
    
    function beforeFilter() {
    	parent::beforeFilter();
    }
    
    function beforeRender() {
        parent::beforeRender();
    }
}