<div class="gallery index">
<h2><?php __('Galleries');?></h2>
<table cellpadding="0" cellspacing="0">
<tr>
	<th><?php echo $paginator->sort('id');?></th>
	<th><?php echo $paginator->sort('slug');?></th>
	<th><?php echo $paginator->sort('name');?></th>
	<th><?php echo $paginator->sort('type');?></th>
	<th><?php echo $paginator->sort('params');?></th>
	<th class="actions"><?php __('Actions');?></th>
</tr>
<?php
$i = 0;
foreach ($galleries as $gallery):
	$class = null;
	if ($i++ % 2 == 0) {
		$class = ' class="altrow"';
	}
?>
	<tr<?php echo $class;?>>
		<td>
			<?php echo $gallery['WildGallery']['id']; ?>
		</td>
		<td>
			<?php echo $gallery['WildGallery']['slug']; ?>
		</td>
		<td>
			<?php echo $gallery['WildGallery']['name']; ?>
		</td>
		<td>
			<?php echo $gallery['WildGallery']['type']; ?>
		</td>
		<td>
			<?php echo $gallery['WildGallery']['params']; ?>
		</td>
		<td class="actions">
			<?php echo $html->link(__('View', true), '/' . Configure::read('Wildflower.galleryView') . '/' . $gallery['WildGallery']['slug'] . '/'); ?>
		</td>
	</tr>
<?php endforeach; ?>
</table>
</div>