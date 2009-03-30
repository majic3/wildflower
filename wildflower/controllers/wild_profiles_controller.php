<?php
class WildProfilesController extends AppController {

    public $helpers = array('List', 'Time');
    public $pageTitle = 'User Profiles';


	function wf_index() {
		$this->WildProfile->recursive = 0;
		$this->set('profiles', $this->paginate());
	}

	function wf_view($id = null) {
		if (!$id) {
			$this->flash(__('Invalid Profile', true), array('action'=>'index'));
		}
		$this->set('profile', $this->WildProfile->read(null, $id));
	}

	function wf_create() {
		if (!empty($this->data)) {
			$this->WildProfile->create();
			if ($this->WildProfile->save($this->data)) {
			} else {
			}
		}
        $this->redirect('/wf/users/edit/', $this->{$this->modelClass}->user_id);
	}

	function wf_edit($id=null) {
        $this->data = $this->WildProfile->findById($id);
        if (empty($this->data)) $this->cakeError('object_not_found');
    }
    
    function wf_update() { 
        $this->WildProfile->create($this->data);
        if ($this->WildProfile->save()) {
            return $this->redirect('/wf/users/');
        }
	}

	function wf_delete($id = null) {
		if (!$id) {
			$this->flash(__('Invalid Profile', true), array('action'=>'index'));
		}
		if ($this->WildProfile->del($id)) {
			$this->flash(__('Profile deleted', true), array('action'=>'index'));
		}
	} 
    
    function beforeFilter() {
    	parent::beforeFilter();
    	
    	$this->pageTitle = 'Profiles';
    	
    	$this->params['current']['type'] = 'profiles';
    }
    
    function beforeRender() {
        parent::beforeRender();
        $this->set('isProfiles', true);
        $this->params['Wildflower']['view']['isProfiles'] = true;
    }

}
?>