<h2 class="section">Editing Asset: <?php echo $this->data['Asset']['title'] ? $this->data['Asset']['title'] : $this->data['Asset']['name']; ?></h2>
<?php
echo $navigation->create(array(
        'All files' => array('action' => 'index')
    ), array('id' => 'sub-nav', 'class' => 'always-current'));
?>


<?php 
	$mprefix = Configure::read('Wildflower.mediaRoute');
    // If file is image display it fitting the wrap
    $isImage = (strpos($this->data['Asset']['mime'], 'image') === 0);
    if ($isImage) {
        echo $html->image("/$mprefix/thumbnail/{$this->data['Asset']['name']}/600/1000"),
            '<p class="image-resized-notice">This image is resized. ',
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

<div id="file-upload">
    <?php
        echo 
        $form->create('Asset', array('type' => 'file', 'url' => $html->url(array('action' => 'admin_update', 'base' => false)))),
        $form->input('title', array('between' => '<br />', 'label' => 'Title <small>(optional)</small>')),
        '<div>',
		$tagging->input('tags'),
        $form->hidden('id'),
        '</div>',
        $wild->submit('Save'),
        $form->end();
    ?>
</div>


<?php /*make this upload new replacement of current image */ $partialLayout->blockStart('sidebar'); ?>
    <li class="sidebar-box">
        <?php echo $this->element('../assets/_upload_file_box'); ?>
    </li>
    <li class="sidebar-box">
		<?php echo $tagging->generateCloud($tag_cloud); ?>
    </li>
<?php $partialLayout->blockEnd(); ?>