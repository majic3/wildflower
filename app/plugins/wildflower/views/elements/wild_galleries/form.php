<?php echo $form->create('WildGallery');?>
	<fieldset>
 		<legend><?php __('Edit Gallery');?></legend>
	<?php
		echo $form->input('id');
		echo $form->input('slug');
		echo $form->input('name');
		echo $form->input('type');
		echo $form->input('params');
	?>
	</fieldset>
<?php echo $form->end('Submit');?>
