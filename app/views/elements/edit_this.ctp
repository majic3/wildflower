<?php 
// mce has some other interesting options - Cool Concept possible: utilize these to make a basic in script applied editor with basic features and a floating outside menu
if ($isLogged) {
	$controller = isset($controller) ? $controller : $this->params['controller'];
    echo '<p class="edit-this">',
         $html->link('Edit', array('controller' => $controller, 'action' => 'admin_edit', $id)),
         '</p>';	
}
?>