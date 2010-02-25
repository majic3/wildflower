
        <h4>Tags</h4>
        <?php

		$url = am(array(               // URL params
					'plugin' => (isset($plugin) ? $plugin : false),
					'controller' => (isset($controller) ? $controller : 'tags'),
					'action' => (isset($action) ? $action : 'view'),
					'pass' => array('slug', 'id'),
					'admin' => false), $this->passedArgs);

		if(isset($default) && $default === true)	{
			//$urlString = '/search';
			$url['plugin'] = 'tagging';
			//$url['plugin'] = 'tagging';
		}

		if(isset($widget) && $widget === true)	{

		}

		echo $tagging->generateCloud($tagCloud, array(
				'max_scale' => 10,            // CSS class max scale
				'linkClass' => 'size-class-', // CSS class name prefix
				'element' => false,           // Element, see above
				'type' => 'div',              // Type of output 
				'id' => (isset($id) ? $id : 'cloud'),          // DOM id for top level 'type'
				'class' => 'cloud',           // CSS class for top level 'type'
				'itemType' => 'span',         // type of item output
				'itemClass' => 'cloud-item',  // CSS class for items of type 'itemType'
				'url' => $url
				)
	); ?>