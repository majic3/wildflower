<h4 class="add"><?php __('Upload a new file'); ?></h4>
<?php

	$action = isset($data) ? 'admin_update' : 'admin_create';

	echo 
	$form->create('Asset', array('type' => 'file', 'action' => $action)),
    $form->input('file', array('type' => 'file', 'between' => '<br />', 'label' => false)),
    $form->input('title', array('between' => '<br />', 'label' => 'Title <small>(optional)</small>')),
	$tagging->input('tags'),
    "<p><small>$uploadLimits.</small></p>",
    $form->submit('Upload file');

	if($action == 'admin_update')	echo $form->input('id');

	echo 
    $form->end();
?>
