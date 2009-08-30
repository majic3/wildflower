<?php
class MenusController extends AppController {
    
	public $components = array('RequestHandler');
    public $pageTitle = 'Navigation';
    
    function admin_add() {
        if (!empty($this->data)) {
            $this->_addOrderToItems();
            $this->data['Menu']['slug'] = Inflector::slug($this->data['Menu']['title']);
            if ($this->Menu->saveAll($this->data)) {
                $this->Session->setFlash(__('Menu created.', true));
                return $this->redirect(array('action' => 'index', 'controller' => 'sidebars'));
            }
        }
    }
    
    function admin_edit($id) {
        if (!empty($this->data)) {
            $this->_addOrderToItems();
            //var_dump($this->data);die();
            if ($this->Menu->saveAll($this->data)) {
                $this->Session->setFlash(__('Menu updated.', true));
                return $this->redirect(array('action' => 'edit', $id));
            }
        } else {
            $this->Menu->contain(array('MenuItem' => array('order' => 'MenuItem.order ASC')));
            $this->data = $this->Menu->findById($id);
        }
    }
    
    function admin_tree($modelName = 'Page') {
		$this->helpers[] = 'tree';
		$params['modelName'] = $modelName;
		if($modelName == 'Page')	{
			$params = array('model'=> 'Page', 'element'=> 'list_item', 'alias'=> 'title');
			$Page = ClassRegistry::init('Page');
			$Page->recursive = -1;
			$pages = $Page->find('all', array('fields' => array('title', 'url', 'lft', 'rght'), 'order' => 'lft ASC'));
			if (empty($pages)) {
				// error!! Danger Will Robinson
			}
			$data = $pages;
		} else {
			$params = array('model'=> 'Category', 'element'=> 'cat_list_item', 'alias'=> 'title');
			$Category = ClassRegistry::init('Category');
			$Category->recursive = -1;
			$categories = $Category->find('all', array('fields' => array('title', 'slug', 'lft', 'rght'), 'order' => 'lft ASC'));
			if (empty($categories)) {
				// error 
			}
			$data = $categories;
		}

		$this->layout = 'xml';
		Configure::write('debug', 0);
		header('content-type: application/json');
		$this->set(compact('data', 'params'));
    }
    
    private function _addOrderToItems() {
        $pos = 0;
        foreach ($this->data['MenuItem'] as &$item) {
            $item['order'] = $pos;
            $pos++;
        }
    }
    
}