<h2 class="section">Assets</h2>
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

			<span style="AssetCategory">Category: <?php echo $file['Category']['title']; ?></span>

			<?php
				$iconOrThumbnail = $thumbUrl = '';
				if($mimeClass[0] == 'image') {
					$iconOrThumbnail = $hasThumb = $hasPreview = false;
					$thumbUrl = preg_replace(
							'/([^.]*)\.(gif|png|jpg)/', 
							'\1_cropped.\2', 
							$file['Asset']['name']
						);

					if(file_exists(WWW_ROOT . 'wildflower' . DS . 'img' . DS . 'assets' . DS . $thumbUrl))
					{
						$thumbUrl = "/wildflower/img/assets/$thumbUrl";
						$hasThumb = true;
					} else {
						$thumbUrl = '/wildflower/img/1x1.png';
					}

					$previewUrl = preg_replace(
							'/([^.]*)\.(gif|png|jpg)/', 
							'\1_preview.\2', 
							$file['Asset']['name']
						);

					if(file_exists(WWW_ROOT . 'wildflower' . DS . 'img' . DS . 'assets' . DS . $previewUrl))
					{
						$previewUrl = "/wildflower/img/assets/$previewUrl";
						$hasPreview = true;
					} else {
						$previewUrl = "/admin/assets/preview_image/{$file['Asset']['name']}";
					}

					// $iconOrThumbnail = ($displayNumImgsArr < 20) ? $thumbUrl : '/wildflower/img/1x1.png';

					$iconOrThumbnail = ($thumbUrl) ? $thumbUrl : '/wildflower/img/1x1.png';

					$iconOrThumbnail = $html->link(
						$html->image(
							$iconOrThumbnail, 
							array(
								'width' => 95, 
								'height' => 95, 
								'class' => ($hasThumb ? 'thumbnail exists' : 'thumbnail')
							)
						),
						array(
							'action' => 'edit', 
							$file['Asset']['id']
						),
						array(
							'class' => ($hasPreview ? 'icon preview' : 'icon'),
							'rel' => $previewUrl,
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
		<?php echo $this->element('admin_tag_cloud'); ?>
	</li>
	<li class="sidebar-box">
	<h4>Filter by Category:</h4>
		<ul>
			<li><?php echo $htmla->link('All', array('action' => 'index')); ?></li>
			<?php foreach($categories as $filterIndex=>$fileCategory): ?>
			<li><?php echo $html->link(ucfirst($fileCategory),array('action' => 'index',$filterIndex)) ?></li>
			<?php endforeach; ?>
		</ul>
	</li>
<?php $partialLayout->blockEnd(); ?>

