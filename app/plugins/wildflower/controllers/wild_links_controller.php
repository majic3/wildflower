<?php
class WildLinksController extends WildflowerAppController {
	public $helpers = array('Cache', 'Wildflower.List', 'Rss', 'Wildflower.Textile', 'Wildflower.Category', 'Wildflower.Tree', 'Wildflower.Navigation', 'Time');
	/** Pagination options for the wf_index action **/
    public $paginate = array(
        'limit' => 30,
        'order' => array('WildLink.created' => 'desc'),
    );
    
    function wf_add() {
        if (!empty($this->data)) {
            if ($this->WildLink->save($this->data)) {
                $this->Session->setFlash('You\'ve written a new post.');
                $this->redirect(array('action' => 'wf_edit', $this->WildLink->id));
            }
        }
    }

    /**
     * Create a post and redirect to it's edit screen
     *
     */
    function wf_create() {
        $this->data[$this->modelClass] = $this->data[$this->modelClass];
        $this->{$this->modelClass}->create($this->data);
        $this->{$this->modelClass}->save();
        $this->redirect(array('action' => 'wf_edit', $this->{$this->modelClass}->id));
    }
    
    /**
     * Links overview
     * 
     */
    function wf_index() {
    	$links = $this->paginate($this->modelClass);
        $this->set('links', $links);
    }

    /**
     * Edit page
     * 
     * @param int $id post ID
     */
    function wf_edit($id = null) {
        if (empty($this->data)) {
            $this->WildLink->contain(array('WildCategory'));
            $this->data = $this->WildLink->findById($id);
            if (empty($this->data)) return $this->cakeError('object_not_found');
        } else {
            if ($this->WildLink->save($this->data)) {
                return $this->redirect(array('action' => 'wf_edit', $this->WildLink->id));
            }
        }
        
        // Categories
        $categories = $this->WildLink->WildCategory->find('list', array('fields' => array('id', 'title')));
        $inCategories = Set::extract($this->data['WildCategory'], '{n}.id');
        
        $this->set(compact('categories', 'inCategories'));
        $this->pageTitle = $this->data[$this->modelClass]['name'];
    }
    
    function wf_categorize($id = null) {
        $this->WildLink->contain(array('WildCategory'));
        $this->data = $this->WildLink->findById($id);
        
        if (empty($this->data)) return $this->cakeError('object_not_found');
   
        $categories = $this->WildLink->WildCategory->find('list', array('fields' => array('id', 'title')));
        $inCategories = Set::extract($this->data['WildCategory'], '{n}.id');
        $categoriesForTree = $this->WildLink->WildCategory->find('all', array('order' => 'lft ASC', 'recursive' => -1));
        $this->set(compact('categories', 'inCategories', 'categoriesForTree'));
        
        $this->pageTitle = $this->data[$this->modelClass]['name'];
    }
    
    function wf_options($id = null) {
        $this->WildLink->contain(array('WildCategory'));
        $this->data = $this->WildLink->findById($id);
        
        if (empty($this->data)) return $this->cakeError('object_not_found');
        
        $this->pageTitle = $this->data[$this->modelClass]['name'];
    }
    
    function wf_update() {

        // add an active toggle here

        unset($this->data['__save']);
        
        $this->WildLink->create($this->data);
        
        if (!$this->WildLink->exists()) return $this->cakeError('object_not_found');
        
        if (isset($this->data[$this->modelClass]['categories_can_be_empty']) && !isset($this->data['WildCategory'])) {
             // Delete all post categories
             $this->WildLink->query("DELETE FROM categories_links WHERE post_id = {$this->WildLink->id}");
        }

        if (!$this->WildLink->save()) return $this->cakeError('save_error'); // @TODO Rendering the exact save errors would be better

        // $cacheName = str_replace('-', '_', $this->data[$this->modelClass]['slug']); // @TODO check cache for proper naming method
        // clearCache($cacheName, 'views', '.php');
		
        if ($this->RequestHandler->isAjax()) {
            $this->WildLink->contain('WildUser');
            $link = $this->WildLink->findById($this->WildLink->id);
            $this->set(compact('link'));
            return $this->render('wf_update');
        }

        $this->redirect(array('action' => 'edit', $this->WildLink->id));
    }
    
    function beforeFilter() {
    	parent::beforeFilter();
    	
    	$this->pageTitle = 'Links';
    	
    	$this->params['current']['type'] = 'links';
    }
    
    function beforeRender() {
        parent::beforeRender();
        $this->set('isLinks', true);
        $this->params['Wildflower']['view']['isLinks'] = true;
    }
    
    /**
     * Display links from a certain category
     *
     */
    function category() {
    	$slug = WildflowerHelper::slug($this->params['slug']);
    	
    	$this->WildLink->Category->Behaviors->attach('Containable');
        $this->WildLink->Category->contain("Link.id");
        $category = $this->WildLink->Category->findBySlug($slug);

        $ids = array();
        foreach ($category[$this->modelClass] as $post) {
            $ids[] = $post['id'];
        }
        
        $in = implode(', ', $ids);
        $scope = "Link.id IN ($in)";
    	$links = $this->paginate($this->modelClass, $scope);
    	
    	$this->set(array('links' => $links, 'linksCategory' => $category));
    }
     
    /**
     * Links index
     * 
     */
    function index() {
    	$this->cacheAction = true;
    	
    	$this->pageTitle = 'Links';
    	
        $this->paginate = array(
	        'limit' => 5,
	        'order' => array('WildLink.created' => 'desc'),
			'conditions' => 'WildLink.draft = 0'
	    );
	    $links = $this->paginate($this->modelClass);
	    
        if (isset($this->params['requested'])) {
            return $links;
        }
        $this->set('links', $links);
    }

}
