<?php
App::import('Vendor', 'SimpleHtmlDom', array('file' => 'simple_html_dom.php'));

class WildHelper extends AppHelper {
	
	public $helpers = array('Html', 'Textile', 'Htmla', 'Tree');
	private $_isFirstChild = true;
	private $itemCssClassPrefix;
	
	/**
	 * @depracated Right now routes are so good the $html->link does all the magic
	 *
	 * Link to the Wildflower admin
	 *
	 * @TODO Support for all $html->link args, named params in route
	 */
	function link($label, $route, $attributes) {
		if (is_array($route)) {
			if (!isset($route['controller'])) {
				$route['controller'] = $this->params['controller'];
			}
			// Wf shortcut
			$route['controller'] = str_replace('', '', $route['controller']);
			$_route = '/' . Configure::read('Routing.admin') 
				. '/' . $route['controller'];
			if (isset($route['action'])) {
				$_route .= '/' . $route['action'];
			}
			unset($route['controller'], $route['action']);
			$_route .= '/' . join('/', $route);
			$route = $_route;
		}
		
		return $this->Html->link($label, $route, $attributes);
	}
	
	/**
	 * Get home (/) link tag with site name as label
	 *
	 * @param string $siteName
	 * @return string Link HTML
	 */
	function homeLink($siteName) {
	    $siteName = hsc($siteName);
	    return $this->Html->link("<span>$siteName</span>", '/', array('title' => 'Home'), null, null, false);
	}
	
	function keyWordsMetaTag($default = '') {
	    if (isset($this->params['pageMeta']['keywordsMetaTag']) && !empty($this->params['pageMeta']['keywordsMetaTag'])) {
	        return hsc($this->params['pageMeta']['keywordsMetaTag']);
	    }
	    
	    return $default;
	}
	
	/**
	 * return the image width & height of asset
	 *
	 * @param string $ImageName
	 * @return array of getimagesize
	 */
	function getAssetSize($ImageName) {

		/*
		    * Asset
          o id18
          o name1251391654322.png
          o title1251391654322
          o mimeimage/png
          o created2009-08-29 01:16:26
          o updated2009-08-29 01:16:26

		*/

		$filename = Configure::read('Wildflower.uploadDirectory') . DS . $ImageName;

		return getimagesize($filename);
	}
	
	/**
	 * Generate <body> tag with class attribute. Values are
	 * home, page, post. customise this 
	 *
	 * @param string $class = null
	 * @param string $id = null (TODO)
	 * @return string
	 */
	function bodyTagWithClass($class = null) {
        
        if($class)    {   return '<body class="'.$class.'">';    }

		if (!isset($this->params['Wildflower']['view'])) {
			return '<body>';
		}
		
	    extract($this->params['Wildflower']['view']);
	    $html = '<body';
	    if ($isHome) { 
	       $html .= ' class="home"'; 
	    } else if ($isPage) {
	       $pageSlug = '';
	       if (isset($this->params['current']['slug'])) {
              $pageSlug = ' ' . $this->params['current']['slug'];           
	       }
           if ($this->params['controller'] == 'messages') {
              $pageSlug = ' contact';           
           }
	       $html .= ' class="page' . $pageSlug . '"'; 
	    } else if ($isPosts) { 
	       $html .= ' class="' . (($this->action == 'view') ? 'post' : 'posts') . '"'; 
	    } else if (isset($this->params['current']['body_class'])) {
	       $html .= " class=\"{$this->params['current']['body_class']}\"";
	    }
	    $html .= '>';
        return $html;
	}
	
	function descriptionMetaTag($default = '') {
        if (isset($this->params['pageMeta']['descriptionMetaTag']) && !empty($this->params['pageMeta']['descriptionMetaTag'])) {
            return hsc($this->params['pageMeta']['descriptionMetaTag']);
        }
        
        return $default;
    }
    

	/**
	 * Generate <body> tag with class attribute. Values are
	 * home-page, page-view, post-view. customise this 
	 *
	 * @param string $class = null
	 * @return string
	 */
	/* moved customised navigation here - be able to have class + customised output - if id is null id should be made from title of menu or menu id  */
    function menu($slug, $id = null, $class = null) {
    	$items = $this->getMenuItems($slug);
    	if (empty($items)) {
    	    return '<p>' . __('Wildflower: There are no menu items for this menu.', true) . '</p>';
    	}
    	$links = array();
    	foreach ($items as $item) {
    	    $label = hsc($item['label']);
    	    $slug = self::slug($item['label']);
    	    $classes = array('nav-' . $slug);
    	    $isCurrent = ($this->here === $this->Html->url($item['url']));
    	    if ($isCurrent) {
    	        $classes[] = 'current';
    	    }
    	    $links[] = '<li class="' . join(' ', $classes) . '">' . $this->Html->link("<span>$label</span>", $item['url'], array('escape' => false)) . '</li>';
    	}
    	$links = join("\n", $links);
		// slug is already set above so id of nav is always the last item (making it from slug might be great for seo but using classes avoids uniqueness of ids)
		if($id === false)	{
    	    $id = '';
		}	elseif (is_null($id)) {
    	    $id = ' id="' . $slug . '"';
    	}
    	if (!is_null($class)) {
			// slug is already set above so id of nav is always the last item (making it from slug might be great for seo but using classes avoids uniqueness of ids)
    	    $class = ' class="' . $class . '"';
    	} else {
			$class = '';
		}
    	return "<ul$id$class>\n$links\n</ul>\n";
    }
    
    function getMenuItems($slug) {
        $Menu = ClassRegistry::init('Menu');
        $Menu->contain(array('MenuItem' => array('order' => 'MenuItem.order ASC')));
        $menu = $Menu->findBySlug($slug);
        return $menu['MenuItem'];
    }
    
    function submit($label = 'Save') {
        $button = '<div class="submit"><button type="submit"><span class="bl1"><span class="bl2">' . $label . '</span></span></button></div>';
        return $button;
    }
    
    private function _createListNode($label, $link, $childPages = null) {
        $slug = $this->_getMenuSlug($label);
        $label = hsc($label);
        $node = $this->Html->link("<span>$label</span>", $link, array('class' => "{$this->itemCssClassPrefix}$slug-link"), null, false);
    
        if ($childPages) {
            $node .= " {$this->menu($childPages)}";
        }
        
        $liAttr = array();
        if ($this->_isFirstChild) {
            $liAttr[] = 'first';
            $this->_isFirstChild = false;
        }
        if ($link == $this->here) {
        	$liAttr[] = 'current';
        }
        
        $liAttr = $this->getClassAttr($liAttr);
        return "<li$liAttr>$node</li>\n";
    }
    
    function processWidgets($html) {
        // Find the widget element
        $selector = '.admin_widget';
        $dom = str_get_html($html);
        $widgets = $dom->find($selector);
        $Widget = ClassRegistry::init('Widget');
        $view = ClassRegistry::getObject('view');
        foreach ($widgets as $widget) {
            $widgetId = $widget->id;
            $widgetClass = $widget->class;
            $instanceId = intval(r('admin_widget admin_widget_id_', '', $widgetClass));
            $data = $Widget->findById($instanceId);
            $data = json_decode($data['Widget']['config'], true);
            $replaceWith = $view->element('widgets/' . $widgetId, array('data' => $data));
            $replace = $widget->outertext;
            if ($widget->parent()->tag == 'p') {
                $replace = $widget->parent()->outertext;
            }
            // Replace the widget placeholder with real stuff
            $html = r($replace, $replaceWith, $html);
        }
        return $html;
    }
    
    function subPageTree($id) {
        //$pageSlug = end(array_filter(explode('/', $this->params['url']['url'])));
        $Page = ClassRegistry::init('Page');
        $Page->recursive = -1;
		//	nested tree - be able to skip to id & set extra data to be returned
		$pages = $Page->find('all', array('conditions' => array('Page.draft' => '0'),'fields' => array('title', 'url', 'lft', 'rght'), 'order' => 'lft ASC'));
		//$pages = $Page->findAllThreaded(null, array('title', 'url', 'rght', 'lft'), array('title', 'url'));
		if (empty($pages)) {
			return '';
		}
		// debug($pages);
		return $this->Tree->generate ($pages, array('model'=> 'Page', 'element'=> 'list_item', 'alias'=> 'title', 'class' => 'tabs'));
    }
    
    function catTree() {
		//Configure::write('debug', 2);
        $Category = ClassRegistry::init('Category');
        $Category->recursive = -1;
		//	nested tree - be able to skip to id & set extra data to be returned
		$categories = $Category->find('all', array('fields' => array('title', 'slug', 'lft', 'rght'), 'order' => 'lft ASC'));
		//$pages = $Page->findAllThreaded(null, array('title', 'url', 'rght', 'lft'), array('title', 'url'));
		if (empty($categories)) {
			return '';
		}
		// debug($pages);
		return $this->Tree->generate ($categories, array('model'=> 'Category', 'element'=> 'cat_list_item', 'alias'=> 'title', 'class' => 'tabs'));
    }
    
    function subPageNav($tree = false) {
        $pageSlug = end(array_filter(explode('/', $this->params['url']['url'])));
        $Page = ClassRegistry::init('Page');
        $Page->recursive = -1;

		if($tree)	{
			//	nested tree - be able to skip to id & set extra data to be returned
			$pages = $Page->getListThreaded(null, 'title', true);
			if (empty($pages)) {
				return '';
			}
			return $pages;
			$html = '<ul class="tabs">';
			
			// Build HTML
			foreach ($pages as $page) {
				if($page)

				$html .= '<li>' . $this->Htmla->link($page['title'], $page['url'], array('strict' => true)) . '</li>';
			}
			$html .= '</ul>';
		} else {
			// Get the parent page slug
			$url = $this->params['url']['url'];
			$slug = array_shift(explode('/', $url));
			$pages = $Page->findAllBySlugWithChildren($slug);

			if (empty($pages)) {
				return '';
			}
			$html = '<ul class="tabs">';
			
			// Build HTML
			foreach ($pages as $page) {
				$html .= '<li>' . $this->Htmla->link($page['Page']['title'], $page['Page']['url'], array('strict' => true)) . '</li>';
			}
			$html .= '</ul>';
		}

        return $html;
    }
    
    function latestCommentsList() {
		// select c.id, c.name && c.content, p.slug from comments as c, posts as p where c.approved 1 and c.spam 0 recurive 1 
        $Comment = ClassRegistry::init('Comment');
        $Comment->recursive = 1;

        $comments = $Comment->find('all');

        if (empty($comments)) {
            return '';
        }
        $html = '<ul class="comments">';
        
        // Build HTML
        foreach ($comments as $comment) {
            $html .= '<li>' . $this->Htmla->link($comment['Comment']['content'], '/' . Configure::read('Wildflower.postsParent') . '/' . $comment['Post']['slug'] . '#comment-' .  $comment['Comment']['id'], array('strict' => true)) . '<span>'.$comment['Comment']['name'].'</span>' . '</li>';
        }
        $html .= '</ul>';
        return $html;
    }
    
    function catsNav() {
//        $catSlug = end(array_filter(explode('/', $this->params['url']['url'])));
        $Category = ClassRegistry::init('Category');
        $Category->recursive = -1;
        
        // TODO: Get the cats belonging to a cat by curren cat if selected be able to go deep
        //$url = $this->params['url']['url'];
  //      $slug = array_shift(explode('/', $url));
        $categories = $Category->find('all', array('order' => 'lft ASC'));

        if (empty($categories)) {
            return '';
        }
        $html = '<ul class="nv vert">';
        
        // Build HTML
        foreach ($categories as $category) {
            $html .= '<li>' . $this->Htmla->link($category['Category']['title'], '/' . Configure::read('Wildflower.catsParent') . '/' . $category['Category']['slug'], array('strict' => true)) . '</li>';
        }
        $html .= '</ul>';
        return $html;
    }
    
    function postsFromCategory($slug) {
        $Category = ClassRegistry::init('Category');
        $Category->contain(array(
            'Post' => array(
                'conditions' => array(
                    'draft' => 0
                )
            ),
            'Post.User'
        ));
        $category = $Category->findBySlug($slug);
        $posts = $category['Post'];
        return $posts;
    }
    
	// process moudles or module
    function processModule($ModContent) {
		$params = Array(
			'fancy' => false,
			'title' => '',
			'content' => '',
			'foot' => '',
			'fancy' => false,
			'useTitle' => true
		);
		$return = '';

		$View =& ClassRegistry::getObject('view');

        ///debug($$ModContent);die();

		if(is_array($ModContent))	{
			foreach($ModContent as $item => $module)	{
				//  if the mod has params decode & merge them 
                if(array_key_exists('params', $module))    {
                    $moduleParams = $this->decodeParams($module['params']);
                    $moduleParams['content'] = $module['content'];
                    $return.= $View->element('oo_css_module', am($params, $moduleParams));
                } else {
                    $moduleParams = $params;
                    $moduleParams['content'] = $module['content'];
                    $return.= $View->element('oo_css_module', $moduleParams);
                }
			}
			return $return;
		} else {
			$moduleParams = $this->decodeParams($ModContent['params']);
			$moduleParams['content'] = $ModContent['content'];
			$return.= $View->element('oo_css_module', am($params, $moduleParams));
		}
		return $return;
    }
    
	// processsidebar takes an array of sidebar items and processes (may reorder them later)
    function processSidebar($sideBarArr) {
		$content = "";
		$content.= $this->processModule($sideBarArr);
		return $this->processWidgets($content);
    }
    
    function extractContent($content, $class) {
		//$class = Configure::read('Wildflower.blogExerpt');
		//if(preg_match("/class\=\"(\b$class\b|$class\b|\b$class)\"/i", $content)) return $content;

		App::import('Vendor', 'phpQueryObject', Array('file' => 'phpQuery.php'));
		$pq = phpQuery::newDocumentXHTML($content);
        return pq('div.' . $class, $pq)->html();
    }

}