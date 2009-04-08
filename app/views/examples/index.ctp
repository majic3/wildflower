<div class="examples index">
<h2><?php __('Examples');?></h2>
<p>
<?php
echo $paginator->counter(array(
'format' => __('Page %page% of %pages%, showing %current% records out of %count% total, starting on record %start%, ending on %end%', true)
));
?></p>
<table cellpadding="0" cellspacing="0">
<tr>
	<th><?php echo $paginator->sort('id');?></th>
	<th><?php echo $paginator->sort('pos');?></th>
	<th><?php echo $paginator->sort('active');?></th>
	<th><?php echo $paginator->sort('type');?></th>
	<th><?php echo $paginator->sort('slug');?></th>
	<th><?php echo $paginator->sort('title');?></th>
	<th><?php echo $paginator->sort('photo');?></th>
	<th><?php echo $paginator->sort('content');?></th>
	<th><?php echo $paginator->sort('created');?></th>
	<th><?php echo $paginator->sort('updated');?></th>
	<th class="actions"><?php __('Actions');?></th>
</tr>
<?php
$i = 0;
foreach ($examples as $example):
	$class = null;
	if ($i++ % 2 == 0) {
		$class = ' class="altrow"';
	}
?>
	<tr<?php echo $class;?>>
		<td>
			<?php echo $example['Example']['id']; ?>
		</td>
		<td>
			<?php echo $example['Example']['pos']; ?>
		</td>
		<td>
			<?php echo $example['Example']['active']; ?>
		</td>
		<td>
			<?php echo $example['Example']['type']; ?>
		</td>
		<td>
			<?php echo $example['Example']['slug']; ?>
		</td>
		<td>
			<?php echo $example['Example']['title']; ?>
		</td>
		<td>
			<?php echo $example['Example']['photo']; ?>
		</td>
		<td>
			<?php echo $example['Example']['content']; ?>
		</td>
		<td>
			<?php echo $example['Example']['created']; ?>
		</td>
		<td>
			<?php echo $example['Example']['updated']; ?>
		</td>
		<td class="actions">
			<?php echo $html->link(__('View', true), array('action'=>'view', $example['Example']['id'])); ?>
			<?php echo $html->link(__('Edit', true), array('action'=>'edit', $example['Example']['id'])); ?>
			<?php echo $html->link(__('Delete', true), array('action'=>'delete', $example['Example']['id']), null, sprintf(__('Are you sure you want to delete # %s?', true), $example['Example']['id'])); ?>
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
		<li><?php echo $html->link(__('New Example', true), array('action'=>'add')); ?></li>
	</ul>
</div>
