		<div id="header">
			<h1 id="site-title">
				<?php echo $html->link($siteName, '/', array('title' => 'View site home page')) ?>
			</h1><?php if ($isLogged) { ?>
			<p>You are already logged in. There's no need to do it again. <?php echo $html->link('Go to admin area', '/' . Configure::read('Wildflower.prefix')); ?>.</p>
			<?php
			// Auth error message
			if ($session->check('Message.auth')) $session->flash('auth');
			} else { ?>
			<p>Please log in</p>
			<?php } ?>
		</div>
		<div id="content">
			<?php
				echo $form->create('WildUser', array('url' => $here));
				echo $form->input('login', array('between' => '<br />'));
				echo $form->input('password',  array('between' => '<br />'));
			?>
		<div id="remember"><?php echo $form->input('remember', array(
			'type' => 'checkbox',
			'label' => __('Keep me logged in on this computer for 2 weeks.', true))); ?></div>
		<?php
			echo $wild->submit($html->image('/css/img/silk-icons/lock_go.png') . ' Log in');
			echo $form->end();
		?>
			<div class="buttons"><?php echo $html->link($html->image('/css/img/silk-icons/door_out.png') . " exit", '/', array('class' => 'positive'), false, false), $html->link($html->image('/css/img/silk-icons/textfield_key.png') . ' reset', '/wf/resetpass', array('class' => 'negative'), false, false); ?></div>
		</div>