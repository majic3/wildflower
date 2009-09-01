<li class="right_menu main_sidebar">
    <ul>
		<li>
			<?php echo $this->element('../pages/_sidebar_search'); ?>
		</li>
		<li>
        <?php echo $html->link(
            '<span>' . __('Create a new page', true) . '</span>', 
            array('action' => 'admin_create'),
            array('class' => 'add', 'escape' => false)) ?></li>
        <li class="allPagesMenu"><strong><?php echo $htmla->link('All Pages', array('action' => 'index'), array('strict' => true)); ?></strong></li>
        <?php if (isset($this->params['pass'][0])): ?>
        <li><?php echo $htmla->link('Title & body', array('action' => 'edit', $this->params['pass'][0])); ?></li>
        <li><?php echo $htmla->link('History of changes', array('action' => 'versions', $this->params['pass'][0])); ?></li>
        <li><?php echo $htmla->link('Custom Fields', array('action' => 'custom_fields', $this->params['pass'][0])); ?></li>
        <li><?php echo $htmla->link('Sidebar Items', array('action' => 'sidebars', $this->params['pass'][0])); ?></li>
        <li><?php echo $htmla->link('Address, dates and other options', array('action' => 'options', $this->params['pass'][0])); ?></li>
        <?php endif; ?>
    </ul>
</li>