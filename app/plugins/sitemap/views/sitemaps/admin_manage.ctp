<div class="sitemaps form">
<?php echo $form->create('Sitemap');?>
	<fieldset>
 		<legend><?php __('Edit Sitemap');?></legend>
	<?php
	?>
	</fieldset>
<?php echo $form->end('Submit');?>
</div>
<div class="actions">
	<ul>
		<li><?php echo $html->link(__('Delete', true), array('action' => 'delete', $form->value('Sitemap.id')), null, sprintf(__('Are you sure you want to delete # %s?', true), $form->value('Sitemap.id'))); ?></li>
		<li><?php echo $html->link(__('List Sitemaps', true), array('action' => 'index'));?></li>
	</ul>
</div>
