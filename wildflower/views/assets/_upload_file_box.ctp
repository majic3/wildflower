<h4 class="add"><?php __('Upload a new file'); ?></h4>
<?php
	$action = 'admin_create';
	$fileParams = array('type' => 'file', 'between' => '<br />');
	$customData = $link = false;
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

		$customData = $wild->dataInputs('data');
	}

	$glink = $html->link(
			'enable', 
			'#enable', 
			array(
				'id' => 'AssetGalleryEnable'
			)
		);

	echo 
	"<p class=\"frmNotice\"><small>$uploadLimits.</small></p>",
	$form->create('Asset', array('type' => 'file', 'action' => $action)),
	$form->input('file', $fileParams), $link,
	$form->input('title', array('between' => '<br />', 'label' => 'Title <small>(optional)</small>')),
	$tagging->input('tags'),
	$customData,
	'<div class="assetCats">',
	$form->select(
		'category_id', 
		$categories, 
		$cat, 
		false, 
		'-- select --'
	),
	$form->select(
		'gallery_category_id', 
		$galleryCategories, 
		$cat, 
		array('disabled'=>'disabled'), 
		'-- select --'
	),
	$glink,
	'</div>',
	($action == 'admin_update' ? $form->hidden('id') : ''),
	$form->submit($bttnLabel), 
    $form->end();
?>
