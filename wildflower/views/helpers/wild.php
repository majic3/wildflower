<?php
App::import('Vendor', 'SimpleHtmlDom', array('file' => 'simple_html_dom.php'));

class WildHelper extends AppHelper {
	
	public $helpers = array('Html', 'Textile', 'Htmla');
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
			$_route = '/' . Configure::read('Wildflower.prefix') 
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
	 * Generate <body> tag with class attribute. Values are
	 * home-page, page-view, post-view.
	 *
	 * @return string
	 */
	function bodyTagWithClass() {

		if (!isset($this->params['Wildflower']['view'])) {
			return '<body>';
		}
		
	    extract($this->params['Wildflower']['view']);

		if($bdyClass)	{
			return '<body class="'.$bdyClass.'">';
		}

	    $html = '<body';
	    if ($isHome) { 
	       $html .= ' class="home"'; 
	    } else if ($isPage) {
	       $pageSlug = '';
	       if (isset($this->params['current']['slug'])) {
              $pageSlug = $this->params['current']['slug'];           
	       }
	       $html .= ' class="' . $pageSlug . '"'; 
	    } else if ($isPosts) {
			// check for index (posts) or view (post)
	       $html .= ' class="post"'; 
	    } else	{
			$html .= ' class="' . str_replace(array('/', '-'), array('', ''), $here) . '"';
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
    
    function menu($slug, $options = null) {
    	$items = $this->getMenuItems($slug);
    	if (empty($items)) {
    	    return '<p>' . __('Wildflower: There are no menu items for this menu.', true) . '</p>';
    	}
    	$links = array();
		$view = ClassRegistry::getObject('view');
    	foreach ($items as $item) {
    	    $label = hsc($item['label']);
    	    $slug = self::slug($item['label']);
    	    $classes = array('nav-' . $slug);
    	    $isCurrent = (rtrim($this->here, '/') . '/' === rtrim($this->Html->url($item['url']), '/') . '/');
			
	        if (isset($view->viewVars['current_link_for_layout']) && $view->viewVars['current_link_for_layout'] === $item['url']) {
				$isCurrent = true;
			}

    	    if ($isCurrent) {
    	        $classes[] = 'current';
    	    }
    	    $links[] = '<li class="' . join(' ', $classes) . '">' . $this->Html->link("<span>$label</span>", $item['url'], array('escape' => false)) . '</li>';
    	}
    	$links = join("\n", $links);

    	if (isset($options['class'])) {
    	    $class = " class=\"{$options['class']}\"";
    	}

		$id = "$slug";
		if (isset($options['id'])) {
			$id = " id=\"{$options['id']}\"";
		}
    	return "<ul$id$class>\n$links\n</ul>\n";
    }
    
    function getMenuItems($slug) {
        $Menu = ClassRegistry::init('Menu');
        $Menu->contain(array('MenuItem' => array('order' => 'MenuItem.order ASC')));
        $menu = $Menu->findBySlug($slug);
        return $menu['MenuItem'];
    }

	// added second param for option spans - particle tree styling better WO them
    function submit($label = 'Save', $spans = true) {
        $button = $spans ? '<div class="submit"><button type="submit"><span class="bl1"><span class="bl2">' . $label . '</span></span></button></div>' : '<div class="submit"><button type="submit">$label</button></div>';
        return $button;
    }

	/*
	 * ptbuttons - particle tree buttons
	 @buttons - Array of buttons each item is array of url, class & label later make each of these optional except for label href defaults to # class to positive
	 @wrapper - option div wrapper
	 */ 
    function ptbuttons($buttons, $wrapper = 'buttons') {
		$ptbuttons = '';
		foreach($buttons as $btn)	{
			$ptbuttons.= $this->Html->link($btn['label'], $btn['url'], Array('class' => $btn['class']));
		}
		return ($wrapper) ? "<div class=\"$wrapper\">$ptbuttons</div>" : $ptbuttons;
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
    
    function subPageNav() {
        $html = '<ul>';
        $pageSlug = end(array_filter(explode('/', $this->params['url']['url'])));
        $Page = ClassRegistry::init('Page');
        $Page->recursive = -1;
        
        // Get the parent page slug
        $url = $this->params['url']['url'];
        $slug = array_shift(explode('/', $url));
        $pages = $Page->findAllBySlugWithChildren($slug);

        if (empty($pages)) {
            return '';
        }
        
        // Build HTML
        foreach ($pages as $page) {
            $html .= '<li>' . $this->Htmla->link($page['Page']['title'], $page['Page']['url'], array('strict' => true)) . '</li>';
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

	function dateWithTime($time) {
        if (!is_integer($time)) {
            $time = strtotime($time);
        }
        return date('M j, Y, g:ia', $time);
    }
        
    function date($time) {
        if (!is_integer($time)) {
            $time = strtotime($time);
        }
        return date('M j, Y', $time);
    }    
    
    function epicTime($time) {
        if (!is_integer($time)) {
            $time = strtotime($time);
        }
        return date('l', $time) . ', ' . date('F j, Y', $time);
    }

}