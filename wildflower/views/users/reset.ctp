
			<div id="resetBox" class="mod complex"> 
				<b class="top"><b class="tl"></b><b class="tr"></b></b> 
				<div class="inner">
					<div class="hd">
						<h3>Reset your Password</h3>
					</div>
					<div class="bd"><?php
						if(!$this->data):	?>
							<h4><?php __('Enter your login to be sent a reactivation email'); ?></h4>
							<?php echo 
								$form->create('User', array('action' => 'reset')),
								$form->input('login', array('between' => '<br />')),
								$wild->submit('Reset your password'),
								$form->end();
						else:
							echo $html->tag('p', $message, array('class' => $class));
						endif;	?>
					</div>
					<div class="ft">
						<p class="small"><?php echo $html->link("login", '/users/login'); ?> &#124; <?php echo $html->link("Back to $siteName", '/'); ?></p>
					</div>
				</div>
				<b class="bottom"><b class="bl"></b><b class="br"></b></b> 
			</div>