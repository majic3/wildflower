
			<div id="loginBox" class="mod complex"> 
				<b class="top"><b class="tl"></b><b class="tr"></b></b> 
				<div class="inner">
					<div class="hd">
						<h1>Please log in</h1>
					</div>
					<div class="bd">
						<?php if ($isLogged): ?>
						<p class="notice">You are already logged in. There's no need to do it again. <?php echo $html->link('Go to admin area', '/' . Configure::read('Wildflower.prefix')); ?>.</p>
						<?php endif; 

						// Auth error message
						if ($session->check('Message.auth')) {
							$session->flash('auth');
						}

						if ($session->check('Message.flash')) {  
							$session->flash();
						}

						echo $form->create('User', array('url' => $here, 'class' => 'vform'));
						echo $form->input('login', array());
						echo $form->input('password',  array());
						?>
						<div id="remember"><?php echo $form->input('remember', array(
							'type' => 'checkbox',
							'title' => 'Keep me logged in on this computer for 2 weeks.',
							'label' => __('Remember Me?', true))); ?></div>
						<?php

						echo $form->submit('Log in');
						echo $form->end();
						?>
					</div>
					<div class="ft">
						<p class="small"><?php echo $html->link("Reset Password", '/users/reset'); ?> &#124; <?php echo $html->link("Back to $siteName", '/'); ?></p>
					</div>
				</div>
				<b class="bottom"><b class="bl"></b><b class="br"></b></b> 
			</div>