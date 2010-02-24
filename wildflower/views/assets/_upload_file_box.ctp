<h4 class="add"><?php __('Upload a new file'); ?></h4>
<?php
	$action = 'admin_create';
	$fileParams = array('type' => 'file', 'between' => '<br />');
	$link = false;
	$bttnLabel = 'save asset';
	
	if(isset($this->data))	{
		$action = 'admin_update';
		$fileParams =  array('type' => 'file', 'between' => '<br />', 'disabled'=> 'disabled');
		$link = $html->link(
			'enable', 
			'#enable', 
			array(
				'id' => 'AssetFileEnable'
			)
		);
	}

	echo 
	"<p class=\"frmNotice\"><small>$uploadLimits.</small></p>",
	$form->create('Asset', array('type' => 'file', 'action' => $action)),
	$form->input('file', $fileParams), $link,
	$form->input('title', array('between' => '<br />', 'label' => 'Title <small>(optional)</small>')),
	$tagging->input('tags'),
	$form->select(
		'category_id', 
		$categories, 
		$cat, 
		false, 
		'-- select --'
	),
	($action == 'admin_update' ? $form->hidden('id') : ''),
	$form->submit($bttnLabel), 
    $form->end();
?>
