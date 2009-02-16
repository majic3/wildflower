<div class="gallery index">
<h2><?php __('WildGalleries');?></h2>
<p>
<?php
echo $paginator->counter(array(
'format' => __('Page %page% of %pages%, showing %current% records out of %count% total, starting on record %start%, ending on %end%', true)
));
?></p>
<table cellpadding="0" cellspacing="0">
<tr>
	<th><?php echo $paginator->sort('id');?></th>
	<th><?php echo $paginator->sort('slug');?></th>
	<th><?php echo $paginator->sort('name');?></th>
	<th><?php echo $paginator->sort('type');?></th>
	<th><?php echo $paginator->sort('params');?></th>
	<th><?php echo $paginator->sort('created');?></th>
	<th><?php echo $paginator->sort('updated');?></th>
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
		<td>
			<?php echo $gallery['WildGallery']['created']; ?>
		</td>
		<td>
			<?php echo $gallery['WildGallery']['updated']; ?>
		</td>
		<td class="actions">
			<?php echo $html->link(__('View', true), array('action'=>'view', $gallery['WildGallery']['id'])); ?>
			<?php echo $html->link(__('Edit', true), array('action'=>'edit', $gallery['WildGallery']['id'])); ?>
			<?php echo $html->link(__('Delete', true), array('action'=>'delete', $gallery['WildGallery']['id']), null, sprintf(__('Are you sure you want to delete # %s?', true), $gallery['WildGallery']['id'])); ?>
		</td>
	</tr>
<?php endforeach; ?>
</table>
</div>
<div class="paging">
	<?php echo $paginator->prev('<< '.__('previous', true), array(), null, array('class'=>'disabled'));?>
 | 	<?php echo $paginator->numbers();?>
	<?php echo $paginator->next(__('next', true).' >>', array(), null, array('class'=>'disabled'));?>
</div>
<div class="actions">
	<ul>
		<li><?php echo $html->link(__('New WildGallery', true), array('action'=>'add')); ?></li>
	</ul>
</div>
