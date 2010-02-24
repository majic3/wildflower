<h2 class="section">Editing Asset: <?php echo $this->data['Asset']['title'] ? $this->data['Asset']['title'] : $this->data['Asset']['name']; ?></h2>
<?php
echo $navigation->create(array(
        'All files' => array('action' => 'index')
    ), array('id' => 'sub-nav', 'class' => 'always-current'));
?>

<div class="display">
<?php 
	$mprefix = Configure::read('Wildflower.mediaRoute');
    // If file is image display it fitting the wrap
    $isImage = (strpos($this->data['Asset']['mime'], 'image') === 0);
    if ($isImage) {
        echo
			'<div class="fullPreview">',
				$html->image("/$mprefix/thumbnail/{$this->data['Asset']['name']}/600/1000", array('id' => 'imagePreview')),
			'</div><div class="fullAsset">',
				$html->image("/$mprefix/thumbnail/{$this->data['Asset']['name']}/600/1000", array('id' => 'imageAsset')),
			'</div>',
			'<p class="notice"><strong>Notice</strong> This image is resized. ',
				$html->link("View the original image.", '/uploads/' . $this->data['Asset']['name']),
			'</p>';
    } 
    // if not an image give download link
    else {
        echo "<p>This is a file. ",
             $html->link("You can download it.", '/uploads/' . $this->data['Asset']['name']),
             "</p>";
    }
?>
</div>

<?php /*make this upload new replacement of current image */ $partialLayout->blockStart('sidebar'); ?>
    <li class="sidebar-box">
        <?php echo $this->element('../assets/_upload_file_box', array('data' => $this->data)); ?>
    </li>
    <li class="sidebar-box">
		<?php echo $this->element('admin_tag_cloud', array(
			'action' => 'index',
			'wfcore' => true,
			'pass' => array('id', 'slug')
		)); ?>
    </li>
<?php $partialLayout->blockEnd(); ?>