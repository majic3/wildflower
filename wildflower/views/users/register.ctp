
			<div id="registerBox" class="mod complex"> 
				<b class="top"><b class="tl"></b><b class="tr"></b></b> 
				<div class="inner">
					<div class="hd">
						<h4><?php __('Sign up'); ?></h4>
					</div>
					<div class="bd"><?php
						$message = $html->tag('p', $message, array('class' => $class));
						if(strpos('success', $class) === false):
							echo $message, 
								$form->create('User', array('action' => 'register')),
								$form->input('name', array('between' => '<br />')),
								$form->input('email', array('between' => '<br />')),
								$form->input('login', array('between' => '<br />')),
								$form->input('password', array('between' => '<br />')),
								$form->input('confirm_password', array('between' => '<br />', 'type' => 'password')),
								$wild->submit('Create this user'),
								$form->end();
						else:
							echo $message;
						endif;
						?>
					</div>
					<div class="ft">
						<p class="small"><?php echo $html->link("Reset Password", '/users/reset'); ?> &#124; <?php echo $html->link("Back to $siteName", '/'); ?></p>
					</div>
				</div>
				<b class="bottom"><b class="bl"></b><b class="br"></b></b> 
			</div>