<?php
/**
 * Wildflower generic page template.
 *
 * @package wildflower
 */
if(isset($aside_for_layout)): ?><div class="leftCol"><?php
	echo $aside_for_layout;
	?></div><?php
endif; ?>
<div class="rightCol">
    <?php echo $this->element('latest_posts');  ?>
    <?php echo $sidebar_for_layout;  ?>
</div>
<div class="main">
	<h2><?php echo $page['Page']['title']; ?></h2>

	<div class="entry">
	   <?php echo $page['Page']['content']; ?>
	</div>

	<?php echo $this->element('edit_this', array('id' => $page['Page']['id'])) ?>
</div>

