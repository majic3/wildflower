<div class="profiles index">
<h2><?php __('Profiles');?></h2>
<p>
<?php
echo $paginator->counter(array(
'format' => __('Page %page% of %pages%, showing %current% records out of %count% total, starting on record %start%, ending on %end%', true)
));
?></p>
<table cellpadding="0" cellspacing="0">
<tr>
	<th><?php echo $paginator->sort('id');?></th>
	<th><?php echo $paginator->sort('user_id');?></th>
	<th><?php echo $paginator->sort('avatar');?></th>
	<th><?php echo $paginator->sort('name');?></th>
	<th><?php echo $paginator->sort('email');?></th>
	<th><?php echo $paginator->sort('data');?></th>
	<th><?php echo $paginator->sort('url');?></th>
	<th class="actions"><?php __('Actions');?></th>
</tr>
<?php
$i = 0;
foreach ($profiles as $profile):
	$class = null;
	if ($i++ % 2 == 0) {
		$class = ' class="altrow"';
	}
?>
	<tr<?php echo $class;?>>
		<td>
			<?php echo $profile['WildProfile']['id']; ?>
		</td>
		<td>
			<?php echo $html->link($profile['User']['name'], array('controller'=> 'users', 'action'=>'view', $profile['User']['id'])); ?>
		</td>
		<td>
			<?php echo $profile['WildProfile']['avatar']; ?>
		</td>
		<td>
			<?php echo $profile['WildProfile']['name']; ?>
		</td>
		<td>
			<?php echo $profile['WildProfile']['email']; ?>
		</td>
		<td>
			<?php echo $profile['WildProfile']['data']; ?>
		</td>
		<td>
			<?php echo $profile['WildProfile']['url']; ?>
		</td>
		<td class="actions">
			<?php echo $html->link(__('View', true), array('action'=>'view', $profile['WildProfile']['id'])); ?>
			<?php echo $html->link(__('Edit', true), array('action'=>'edit', $profile['WildProfile']['id'])); ?>
			<?php echo $html->link(__('Delete', true), array('action'=>'delete', $profile['WildProfile']['id']), null, sprintf(__('Are you sure you want to delete # %s?', true), $profile['WildProfile']['id'])); ?>
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
		<li><?php echo $html->link(__('New Profile', true), array('action'=>'add')); ?></li>
		<li><?php echo $html->link(__('List Users', true), array('controller'=> 'users', 'action'=>'index')); ?> </li>
		<li><?php echo $html->link(__('New User', true), array('controller'=> 'users', 'action'=>'add')); ?> </li>
	</ul>
</div>
