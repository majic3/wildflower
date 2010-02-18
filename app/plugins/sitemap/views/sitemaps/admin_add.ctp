<div class="sitemaps form">
<?php echo $form->create('Sitemap');?>
	<fieldset>
 		<legend><?php __('Add Sitemap');?></legend>
	<?php
		echo $form->input('title'),
		$form->input('content');
	?>
	</fieldset>
<?php echo $form->end('Submit');?>
</div>
<div class="actions">
	<ul>
		<li><?php echo $html->link(__('List Sitemaps', true), array('action' => 'index'));?></li>
	</ul>
</div>
