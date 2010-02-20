
        <h4 class="sidebar_heading">Tags</h4>
        <?php echo $tagging->generateCloud($tagCloud,  array(
      'max_scale' => 10,            // CSS class max scale
      'linkClass' => 'size-class-', // CSS class name prefix
      'element' => false,           // Element, see above
      'type' => 'div',              // Type of output 
      'id' => 'tag-cloud',          // DOM id for top level 'type'
      'class' => 'cloud',           // CSS class for top level 'type'
      'itemType' => 'span',         // type of item output
      'itemClass' => 'cloud-item',  // CSS class for items of type 'itemType'
      'url' => array(               // URL params
        'plugin' => 'tagging',
        'controller' => 'tags',
        'action' => 'view',
        'pass' => array('slug', 'id'),
        'admin' => true
      ))); ?>