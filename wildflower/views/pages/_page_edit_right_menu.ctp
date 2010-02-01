<li class="right_menu main_sidebar">
    <ul>
        <li class="allPages">
			<strong><?php echo $htmla->link('All Pages', array('action' => 'index'), array('strict' => true)); ?></strong>
			<?php if(isset($jumpMenu)):
				echo 
					str_replace(
						array('&amp;nbsp;', '&nbsp;', '&amp;amp;', '&amp;'), 
						'', 
						$form->select(
							'jumpMenu', 
							$jumpMenu, 
							$this->data['Page']['id'], 
							array(
								'class' => 'jumpMenu'
							), 
							'-- please select --'
						)
					);
			endif; ?>
		</li>
        <?php if (isset($this->params['pass'][0])): ?>
        <li><?php echo $htmla->link('Title & body', array('action' => 'edit', $this->params['pass'][0])); ?></li>
        <li><?php echo $htmla->link('History of changes', array('action' => 'versions', $this->params['pass'][0])); ?></li>
        <li><?php echo $htmla->link('Address, dates and other options', array('action' => 'options', $this->params['pass'][0])); ?></li>
        <li><?php echo $htmla->link('Reigions', array('action' => 'sidebar', $this->params['pass'][0])); ?></li>
        <li><?php echo $htmla->link('Settings', array('action' => 'settings', $this->params['pass'][0])); ?></li>
        <?php endif; ?>
    </ul>
</li>