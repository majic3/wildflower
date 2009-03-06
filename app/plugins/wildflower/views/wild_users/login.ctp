<?php if ($isLogged) { ?>
<p>You are already logged in. There's no need to do it again. <?php echo $html->link('Go to admin area', '/' . Configure::read('Wildflower.prefix')); ?>.</p>
<?php } ?>
<?php
echo $form->create('WildUser', array('url' => $here));
echo $form->input('login', array('between' => '<br />'));
echo $form->input('password',  array('between' => '<br />'));
?>
<div id="remember"><?php echo $form->input('remember', array(
	'type' => 'checkbox',
	'label' => 'Remember me?')); ?></div>
<?php

// Auth error message
if ($session->check('Message.auth')) {
	$session->flash('auth');
}

echo $wild->submit('Log in');
echo $form->end();
?>
<span class="cleaner"></span>
<p class="quiet"><small><?php echo $html->link("Back to $siteName", '/'), ' &#124; ', $html->link('Password Reset', '/wf/resetpass'); ?></small></p>
