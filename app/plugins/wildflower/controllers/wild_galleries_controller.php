<?php
class WildGalleriesController extends WildflowerAppController {

	//public $name = 'WildGalleries'; 
	public $components = array('Wildflower.Flickr', 'Wildflower.Director');
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

		$director = $this->director;
		$director->format->add(array(
			'name' => 'thumb', 
			'width' => '100', 
			'height' => '100', 
			'crop' => 1, 
			'quality' => 75, 
			'sharpening' => 1));
		$director->format->add(array(
			'name' => 'large', 
			'width' => '800', 
			'height' => '450', 
			'crop' => 0, 
			'quality' => 95, 
			'sharpening' => 1));
		$director->format->preview(array(
			'width' => '100', 
			'height' => '50', 
			'crop' => 1, 
			'quality' => 85, 
			'sharpening' => 1));
		$album = $director->album->get(1);
		$contents = $album->contents[0];
		$this->set('director', $director);	 
		$this->set('album', $album);	 
		$this->set('contents', $contents);	 
		
		$photosets = $this->flickr->photosets_getList(Configure::read('Flickr.userID'));
		$this->set('sets', $photosets);
		$currset = (empty($id)) ? $photosets['photoset'][0]['id'] : $id;
		$this->set('currset', $this->flickr->photosets_getInfo($currset));
		$this->set('thumbs', $this->flickr->photosets_getPhotos($currset)); 
		$this->set('flickr', $this->flickr); 
	    
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
     * View a gallery item singular
     *
     */
	function show() { 
		if (Configure::read('AppSettings.cache') == 'on') {
            $this->cacheAction = 60 * 60 * 24 * 3; // Cache for 3 days
        }

        $slug = Sanitize::paranoid($this->params['slug']);
        //$gallery = $this->WildGallery->findBySlugAndDraft($slug, 0);
        $gallery = $this->WildGallery->findBySlug($slug);

		//	if (empty($gallery)) {	return $this->do404();	}
        
        // Gallery title
        $this->pageTitle = $post[$this->modelClass]['name'];
        
        $this->set(array(
            'gallery' => $gallery,
            'descriptionMetaTag' => $gallery[$this->modelClass]['description_meta_tag']
        ));

		$this->set('slug', $slug);
		//$this->set('slug', $slug);

        if (isset($this->params['requested'])) {
            return $gallery;
        }
    }

    /**
     * View a gallery thumbs linking to singular
     *
     */
	function view() {

		if (Configure::read('AppSettings.cache') == 'on') {
            $this->cacheAction = 60 * 60 * 24 * 3; // Cache for 3 days
        }

        $slug = Sanitize::paranoid($this->params['slug']);
        //$gallery = $this->WildGallery->findBySlugAndDraft($slug, 0);
        //$gallery = $this->WildGallery->findBySlug($slug);

		if (empty($gallery)) {	return $this->do404();	}
        
        // Gallery title
        $this->pageTitle = $post[$this->modelClass]['name'];
        
        $this->set(array(
            'gallery' => $gallery,
            'descriptionMetaTag' => $gallery[$this->modelClass]['description_meta_tag']
        ));
		
		$photosets = $this->flickr->photosets_getList(Configure::read('Flickr.userID'));
		$this->set('sets', $photosets);
		$currset = $id == null ? $photosets['photoset'][0]['id'] : $id;
		$this->set('currset', $this->flickr->photosets_getInfo($currset));
		$this->set('thumbs', $this->flickr->photosets_getPhotos($currset)); 

		$this->set('slug', $slug);
		//$this->set('slug', $slug);

        if (isset($this->params['requested'])) {
            return $gallery;
        }
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