<?php
	echo 
	$form->create('WildAsset', array('url' => $html->url(array('action' => 'save_screen')))),
	$form->input('address', array('between' => '<br />', 'label' => 'Title <small>(optional)</small>')),
	$wild->submit('Save'),
	$form->end();
?>