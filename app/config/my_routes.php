<?php

// my_routes.php
Router::connect('/admin/tagging/', array('admin' => true, 'prefix' => 'admin', 'plugin' => 'tagging', 'controller' => 'tagging', 'action' => 'index'));
Router::connect('/tagging/', array('plugin' => 'tagging', 'controller' => 'tagging', 'action' => 'index'));
//Router::connect('/documentation/api/classes', array('plugin' => 'api_generator', 'controller' => 'api_classes', 'action' => 'index'));

?>