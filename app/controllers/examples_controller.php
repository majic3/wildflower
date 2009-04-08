<?php
class ExamplesController extends AppController {
	public $name = 'Examples';	
	public $isHome = false;
	public $helpers = array('Cache', 'Html', 'Form', 'Time');
    public $paginate = array(
        'limit' => 25,
        'order' => array('pos' => 'desc')
    );

	function index() { 
		if (Configure::read('AppSettings.cache') == 'on') {
			$this->cacheAction = 60 * 60 * 24 * 3; // Cache for 3 days
		}
		$examples = $this->Example->findAll('active = 1', Array('id', 'type', 'slug', 'title', 'photo'), 'type, pos ASC');
		$this->set('examples', $examples);
	}

	function view() {
		if (Configure::read('AppSettings.cache') == 'on') {
			$this->cacheAction = 60 * 60 * 24 * 3; // Cache for 3 days
		}

		$slug = $this->params['slug'];
		$example = $this->Example->find("Example.slug = '$slug'");

		$this->set('example', $example);
	}

	function wf_index() {
		$this->Example->recursive = 0;
		$this->Example->paginate = array('fields' => array('Example.id', 'Example.type', 'Example.slug', 'Example.title', 'Example.photo'));
		$this->set('examples', $this->paginate());
	}

	function wf_view($id = null) {
		if (!$id) {
			$this->Session->setFlash(__('Invalid Example.', true));
			$this->redirect(array('action'=>'index'));
		}
		$this->set('example', $this->Example->read(null, $id));
	} 
    
    function wf_update() {
        
        $this->Example->create($this->data);
        if (!$this->Example->exists()) return $this->cakeError('object_not_found');
        
        // Publish?
        if (isset($this->data['__save']['publish'])) {
            $this->data[$this->modelClass]['active'] = 1;
        }
        unset($this->data['__save']);
        
        $example = $this->Example->save();
        if (empty($example)) return $this->cakeError('save_error');
        
        $example = $this->Example->findById($this->Example->id);

        // JSON response
        if ($this->RequestHandler->isAjax()) {
            $this->set(compact('example'));
            return $this->render('wf_update');
        }
        
        $this->redirect(array('action' => 'edit', $this->data[$this->modelClass]['id']));
    }

	function wf_create() {
        $this->data[$this->modelClass]['active'] = 0;
        $this->data[$this->modelClass]['content'] = '';
        $this->data[$this->modelClass]['title'] = '';
        $this->data[$this->modelClass]['pos'] = 0;
        $this->Example->create($this->data);
        $this->Example->save();
		//die($this->Example->id);
        $this->redirect(array('action' => 'edit', $this->Example->id));
	}

	function wf_edit($id = null) {
        $this->data = $this->Example->findById($id);
        if (empty($this->data)) $this->cakeError('object_not_found');
	}
    
    function beforeRender() {
        parent::beforeRender();
        $this->set('isPage', true);
        $this->params['Wildflower']['view']['isPage'] = true;
    }
    
    function beforeFilter() {
        parent::beforeFilter();
    }
}