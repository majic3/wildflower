<div class="profiles form">
<?php echo $form->create('WildProfile', array('enctype'=>"multipart/form-data"));?>
	<fieldset>
 		<legend><?php __('Edit Profile');?></legend>
	<?php
		echo $form->input('id');
		echo $form->input('user_id');
		echo $html->image(substr($profile['WildProfile']['avatar']['s'], 1, strlen($article['WildProfile']['avatar']['s'])));
		echo $form->file('Profile.avatar',array('label'=>__('Article Avatar',true))); 
		echo $form->input('name');
		echo $form->input('email');
		echo $form->input('data');
		echo $form->input('url');
	?>
	</fieldset>
<?php echo $form->end('Submit');?>
</div>
<div class="actions">
	<ul>
		<li><?php echo $html->link(__('Delete', true), array('action'=>'delete', $form->value('Profile.id')), null, sprintf(__('Are you sure you want to delete # %s?', true), $form->value('Profile.id'))); ?></li>
		<li><?php echo $html->link(__('List Profiles', true), array('action'=>'index'));?></li>
		<li><?php echo $html->link(__('List Users', true), array('controller'=> 'users', 'action'=>'index')); ?> </li>
		<li><?php echo $html->link(__('New User', true), array('controller'=> 'users', 'action'=>'add')); ?> </li>
	</ul>
</div>
