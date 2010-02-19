<?php
	echo $form->create('Dashboard', array('url' => '/search', 'id' => 'search'));
	echo $form->text('query', array('id' => 's'));
	echo $form->button('go', array('title' => 'Search', 'alt' => 'Search', 'id' => 'go'));
	echo $form->end();
?>