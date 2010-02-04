<?php

// my_routes.php
//	Router::connect('/admin/tagging/:controller/:action', array('admin' => true, 'prefix' => 'admin', 'plugin' => 'tagging'));
Router::connect('/admin/tagging/*', array('admin' => true, 'prefix' => 'admin', 'plugin' => 'tagging', 'controller' => 'tags', 'action' => 'index'));
Router::connect('/tagging/*', array('plugin' => 'tagging', 'controller' => 'tags', 'action' => 'index'));
//Router::connect('/documentation/api/classes', array('plugin' => 'api_generator', 'controller' => 'api_classes', 'action' => 'index'));

?>