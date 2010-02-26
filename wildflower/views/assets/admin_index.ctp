<h2 class="section">Assets</h2>
<?php

// media prefix set in wf_core.php
$mprefix = Configure::read('Wildflower.mediaRoute');

echo 
	$form->create('Asset', array('action' => 'index', 'type' => 'get', 'class' => 'options')),
	$form->select(
		'limit', 
		$displayNumImgsArr, 
		(isset($this->passedArgs['limit']) ? $this->passedArgs['limit'] : false), 
		array(
			'class' => 'displayNumImgs'
		), 
		'-- please select --'
	);
	echo $form->end();

?>

<?php if (empty($files)): ?>
	<p>No files uploaded yet.</p>
<?php elseif(isset($this->passedArgs['limit']) && ($this->passedArgs['limit'] == 1)): ?>
	<?php 

		// explode the mime - so we know if its image - use after the / as a className
		$mimeClass = explode('/', $files[0]['Asset']['mime']);
		(isset($mimeClass[1]) && $mimeClass[1] == 'jpeg') ? $mimeClass[1] : str_replace('jpeg', 'jpg', isset($mimeClass[1]) ? $mimeClass[1] : null);

		$label = $files[0]['Asset']['title'];
		if (empty($label)) {
			$label = $files[0]['Asset']['name'];
		}
	?>
	<div class="asset<?php	echo ($mimeClass[0] == 'image') ? ' img'  : ' ' . $mimeClass[1];	?>">

	<h3><?php echo $html->link($label, array('action' => 'edit', $files[0]['Asset']['id']),array('class' => 'editTitle')); ?></h3>

	<span style="AssetCategory">Category: <?php echo isset($files[0]['Asset']['categoy_id']) ? $files[0]['Category']['title'] : 'uncategorised'; ?></span><br />

	<a href="<?php echo $html->url(array('action' => 'edit', $files[0]['Asset']['id'])); ?>" class="file edit">
		<?php echo $files[0]['Asset']['name']; ?>
	</a>

	<?php
		echo $html->image('/uploads/' . $files[0]['Asset']['name']);
	?>

	</div>
<?php else: ?>
	
	<?php echo '<div class="assets">', $form->create('Asset', array('action' => 'mass_update')); ?>
	
	<?php echo $this->element('admin_select_actions', array('actions' => array('Edit', 'Delete'))); ?>
	<div id="assetList-nav"></div>
	<ul id="assetList" class="file-list">
	<?php
	foreach ($files as $file): 
			// explode the mime - so we know if its image - use after the / as a className
			$mimeClass = explode('/', $file['Asset']['mime']);
			(isset($mimeClass[1]) && $mimeClass[1] == 'jpeg') ? $mimeClass[1] : str_replace('jpeg', 'jpg', isset($mimeClass[1]) ? $mimeClass[1] : null);
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

			<span style="AssetCategory">Category: <?php echo isset($file['Asset']['categoy_id']) ? $file['Category']['title'] : 'uncategorised'; ?></span><br />

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
			
			<a href="<?php echo $html->url($iconOrThumbnail); ?>" class="file edit">
				<?php echo $text->truncate($file['Asset']['name'], 35, '...'); ?>
			</a>
			
			<span class="cleaner"></span>
		</li>
	<?php endforeach; ?>
	</ul>
	<span class="cleaner"></span>
	<?php
		echo $this->element('admin_select_actions'), $form->end(), '</div>';
endif; ?>

<?php echo $this->element('admin_pagination', array(
	'wfPaging' => array(
			'url' => $this->passedArgs
			)
		)
	); ?>


<?php $partialLayout->blockStart('sidebar'); ?>
	<li class="sidebar-box">
		<?php echo $this->element('../assets/_upload_file_box'); ?>
	</li>
	<li class="sidebar-box">
		<?php echo $this->element('admin_tag_cloud', array(
			//'action' => 'index',
			//'wfcore' => true,
			//'pass' => array('id', 'slug')
		)); ?>
	</li>
	<li class="sidebar-box">
	<h4>Filter by Category:</h4>
		<ul>
			<li><?php echo $htmla->link('All', array('action' => 'index')); ?></li>
			<?php
				foreach($categories as $filterIndex => $fileCategory):
					$class = ($cat == $filterIndex) ? 'current' : false;
			?>
			<li><?php echo $html->link(ucfirst($fileCategory),array('action' => 'index', 'cat:' . $filterIndex), array('class' => $class)); ?></li>
			<?php endforeach; ?>
		</ul>
	</li>
<?php $partialLayout->blockEnd(); ?>

