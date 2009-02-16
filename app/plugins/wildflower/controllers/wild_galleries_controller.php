<?php
class WildGalleriesController extends WildflowerAppController {

	var $name = 'WildGalleries';
	public $helpers = array('Cache', 'Wildflower.List', 'Rss', 'Wildflower.Textile', 'Wildflower.Category', 'Wildflower.Tree', 'Time');
    public $paginate = array(
        'limit' => 10,
        'order' => array('created' => 'desc'),
    );

    /**
     * Gallery index
     *
     */
	function index() {
    	$this->cacheAction = true;

		$this->pageTitle = 'Gallery'; 

        $this->paginate = array(
	        'limit' => 5,
	        'order' => array('WildGallery.created' => 'desc'),
			'conditions' => 'WildGallery.draft = 0'
	    );
	    $galleries = $this->paginate($this->modelClass);
	    
        if (isset($this->params['requested'])) {
            return $galleries;
        }
        $this->set('galleries', $galleries);
	}	
    
    function beforeFilter() {
    	parent::beforeFilter();
    	
    	$this->pageTitle = 'Gallery';
    	
    	$this->params['current']['type'] = 'gallery';
    	$this->params['current']['slug'] = Configure::read('Gallery.blogIndex');
    }
    
    function beforeRender() {
        parent::beforeRender();
        $this->set('isGallery', true);
        $this->params['Wildflower']['view']['isGallery'] = true;
    }

    /**
     * View a gallery entry
     *
     */
	function view() {
        
		if (Configure::read('AppSettings.cache') == 'on') {
            $this->cacheAction = 60 * 60 * 24 * 3; // Cache for 3 days
        }

        $slug = Sanitize::paranoid($this->params['slug']);
        $gallery = $this->WildGallery->findBySlugAndDraft($slug, 0);

		#	if (empty($gallery)) {	return $this->do404();	}
        
        // Gallery title
        $this->pageTitle = $post[$this->modelClass]['name'];
        
        if (isset($this->params['requested'])) {
            return $post;
        }
        
        $this->set(array(
            'gallery' => $gallery,
            'descriptionMetaTag' => $gallery[$this->modelClass]['description_meta_tag']
        ));
    }

    /**
     * Create a gallery entry and redirect to it's edit screen
     *
     */
    function wf_create() {
        $this->{$this->modelClass}->create($this->data);
        $this->{$this->modelClass}->save();
        $this->redirect(array('action' => 'wf_edit', $this->{$this->modelClass}->id));
    }


	function wf_index() {	   
		$this->WildGallery->recursive = 0;
		$this->set('galleries', $this->paginate($this->modelClass));
	}

	function wf_add() {	 
        if (!empty($this->data)) {
            $this->data[$this->modelClass]['draft'] = 1;
            if ($this->WildGallery->save($this->data)) {
                $this->Session->setFlash('You\'ve made a new gallery so add some media.');
                $this->redirect(array('action' => 'wf_edit', $this->WildGallery->id));
            }
        }
	}

	function wf_edit($id = null) {
        if (empty($this->data)) {
            $this->data = $this->WildGallery->findById($id);
            if (empty($this->data)) return $this->cakeError('object_not_found');
        } else {
            if ($this->WildGallery->save($this->data)) {
                return $this->redirect(array('action' => 'wf_edit', $this->WildGallery->id));
            }
        }
        
        // View
        $isDraft = ($this->data[$this->modelClass]['draft'] == 1) ? true : false;
        
        $this->set(compact('isDraft'));
        $this->pageTitle = $this->data[$this->modelClass]['name'];
	}

	function wf_delete($id = null) {
	}
    
    function wf_update() {
        // Publish?
        if (isset($this->data['__save']['publish'])) {
            $this->data[$this->modelClass]['draft'] = 0;
        }
        unset($this->data['__save']);
        
        $this->WildGallery->create($this->data);
        
        if (!$this->WildGallery->exists()) return $this->cakeError('object_not_found');

        if (!$this->WildGallery->save()) return $this->cakeError('save_error');
		
		// @TODO Rendering the exact save errors would be better
        // $cacheName = str_replace('-', '_', $this->data[$this->modelClass]['slug']);
		// @TODO check cache for proper naming method
        // clearCache($cacheName, 'views', '.php');
		
        if ($this->RequestHandler->isAjax()) {
            $post = $this->WildGallery->findById($this->WildGallery->id);
            $this->set(compact('gallery'));
            return $this->render('wf_update');
        }

        $this->redirect(array('action' => 'edit', $this->WildGallery->id));
    }

}