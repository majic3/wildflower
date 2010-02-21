<h4 class="add"><?php __('Upload a new file'); ?></h4>
<?php
	$action = 'admin_create';
	$fileParams = array('type' => 'file', 'between' => '<br />', 'label' => false);
	$link = false;
	
	if(isset($this->data))	{
		$action = 'admin_update';
		$fileParams =  array('type' => 'file', 'between' => '<br />', 'label' => false, 'disabled'=> 'disabled');
		$link = $html->link(
			'enable', 
			'#enable', 
			array(
				'id' => 'AssetFileEnable'
			)
		);
	}

	echo 
	$form->create('Asset', array('type' => 'file', 'action' => $action)),
	$form->input('file', $fileParams), $link,
	$form->input('title', array('between' => '<br />', 'label' => 'Title <small>(optional)</small>')),
	$tagging->input('tags'),
	"<p><small>$uploadLimits.</small></p>",
	$form->submit('Upload file');

	if($action == 'admin_update')	echo $form->hidden('id');

	echo 
    $form->end();
?>
