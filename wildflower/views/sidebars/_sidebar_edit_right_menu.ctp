<li class="right_menu main_sidebar">
    <ul>
        <li class="allSidebars">
			<strong><?php echo $htmla->link('All Regions', array('action' => 'index'), array('strict' => true)); ?></strong>
			<?php if(isset($jumpMenu)):
				echo str_replace(array('&amp;nbsp;', '&nbsp;', '&amp;amp;', '&amp;'), '', $form->select('jumpMenu', $jumpMenu, null, array('class' => 'jumpMenu')));
			endif; ?>
		</li>
        <?php if (isset($this->params['pass'][0])): ?>
        <?php endif; ?>
    </ul>
</li>