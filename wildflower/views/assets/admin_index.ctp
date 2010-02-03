<h2 class="section">Files</h2>
<?php

echo 
	$form->create('Asset', array('action' => 'index', 'type' => 'get', 'class' => 'options')),
	$form->select(
		'displayNumImgs', 
		$displayNumImgsArr, 
		$displayNumImgs, 
		array(
			'class' => 'displayNumImgs'
		), 
		'-- please select --'
	);
	echo $form->end();

?>

<?php if (empty($files)): ?>
	<p>No files uploaded yet.</p>
<?php else: ?>

	<?php echo $form->create('Asset', array('action' => 'mass_update')); ?>
	
	<?php echo $this->element('admin_select_actions', array('actions' => array('Edit', 'Delete'))); ?>
	<div id="assetList-nav"></div>
	<ul id="assetList" class="file-list">
	<?php
	// media prefix set in wf_core.php
	$mprefix = Configure::read('Wildflower.mediaRoute');
	foreach ($files as $file): 
			// explode the mime - so we know if its image - use after the / as a className
			$mimeClass = explode('/', $file['Asset']['mime']);
			($mimeClass[1] == 'jpeg') ? $mimeClass[1] : str_replace('jpeg', 'jpg', $mimeClass[1]);
	?>

		<li id="file-<?php echo $file['Asset']['id']; ?>" class="actions-handle<?php	echo ($mimeClass[0] == 'image') ? ' img'  : ' ' . $mimeClass[1];	?>">
			<span class="row-check"><?php echo $form->checkbox('id.' . $file['Asset']['id']) ?></span>
			<?php 
				$label = $file['Asset']['title'];
				if (empty($label)) {
					$label = $file['Asset']['name'];
				}
			?>

			<h3><?php echo $html->link($text->truncate($label, 35, '...'), array('action' => 'edit', $file['Asset']['id']),array('class' => 'editTitle')); ?></h3>

			<?php
				$iconOrThumbnail = $thumbUrl = '';
				if($mimeClass[0] == 'image') {
					$thumbUrl = "/$mprefix/thumbnail/{$file['Asset']['name']}/";
					$iconOrThumbnail = ($displayNumImgsArr < 20) ? $thumbUrl . '50/50/1' : '/wildflower/img/1x1.png';
					$iconOrThumbnail = $html->link(
						$html->image($iconOrThumbnail, array('class' => 'thumbnail')),
						array('action' => 'edit', $file['Asset']['id']),
						array(
							'class' => 'icon',
							'rel' => $thumbUrl . '200/',
							'title' => 'Preivew of asset ' . $file['Asset']['id']
						), false, false
					);
				} else  {
					$iconOrThumbnail = "<span class=\"icon\">&nbsp;</span>";
				}
				echo $iconOrThumbnail;
				?>

			<span class="row-actions"><?php echo $html->link(__('View', true), Asset::getUploadUrl($file['Asset']['name']), array('class' => '', 'rel' => 'permalink', 'title' => __('View or download this file.', true))); ?></span>
			
			<a href="<?php echo $html->url(); ?>" class="file edit">
				<?php echo $text->truncate($file['Asset']['name'], 35, '...'); ?>
			</a>
			
			<span class="cleaner"></span>
		</li>
			 
	<?php endforeach; ?>
	</ul>
			
			<span class="cleaner"></span>
	
	<?php echo $this->element('admin_select_actions'); ?>
	<?php echo $form->end(); ?>

<?php endif; ?>

<?php echo $this->element('admin_pagination') ?>


<?php $partialLayout->blockStart('sidebar'); ?>
	<li class="sidebar-box">
		<?php echo $this->element('../assets/_upload_file_box'); ?>
	</li>
	<li class="sidebar-box">
		<?php echo $tagging->generateCloud($tag_cloud); ?>
	</li>
<?php $partialLayout->blockEnd(); ?>

