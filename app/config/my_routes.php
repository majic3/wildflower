<?php

// my_routes.php
Router::connect('/admin/tagging/:controller/:action', array('admin' => true, 'prefix' => 'admin', 'plugin' => 'tagging'));
Router::connect('/tags/*', array('plugin' => 'tagging', 'controller' => 'tags', 'action' => 'index'));
Router::connect('/tag/*', array('plugin' => 'tagging', 'controller' => 'tags', 'action' => 'view'));


//Router::connect('/documentation/api/classes', array('plugin' => 'api_generator', 'controller' => 'api_classes', 'action' => 'index'));

?>