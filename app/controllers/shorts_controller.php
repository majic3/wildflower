<?php
class ShortsController extends AppController {

	/*	shorts should be a module	*/

	function beforeFilter() {
		parent::beforeFilter();
    }
    
    function beforeRender() {
        parent::beforeRender();
	}

    /**
     * Shorts administration overview
     * 
     */
    function admin_index() {
        $this->pageTitle = 'Social media Urls - pages, posts &amp; other content';
    	$shorts = $this->Short->find('all', array('order' => 'created ASC'));
    	$this->set(compact('shorts'));
    }

	function admin_create() {
        $this->data['Short']['slug'] = $this->Short->make($this->data['Short']['modelName'], $this->data['Short']['modelName'], $this->data['Short']['modelUrl']);
        $this->Short->create($this->data);
        $this->Short->save();
        $this->redirect(array('action' => 'index'));
    }

	function admin_update() {
		if (empty($this->data)) {
			$this->data = $this->Short->findById($id);
			if (empty($this->data)) return $this->cakeError('object_not_found');
		} else {
			if($this->data['Short']['modelID'])	{
				if ($this->Short->save($this->data)) {
					if($this->data['Short']['modelName'] == 'Page')
						$redirect = array('controller' => 'pages', 'action' => 'admin_options', $this->data['Short']['modelID']);
					elseif($this->data['Short']['modelName'] == 'Post')
						$redirect = array('controller' => 'posts', 'action' => 'admin_options', $this->data['Short']['modelID']);
					return $this->redirect($redirect);
				}
			}
		}
    }

	function admin_delete($id) {
		parent::admin_delete($id);
	}

	/*	retrive full url via short @model that is shortened, @id of that entry, @url is the table field name that is going to be shortened	*/
	function retrive() {
		$short = $this->Short->findBySlug($this->params['slug']);
		$this->redirect($short['Short']['url'], 302); 
	}
}