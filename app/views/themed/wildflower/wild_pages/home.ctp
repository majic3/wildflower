<?php
/**
 * Wildflower/Icing loads this template for home page.
 * Place any other templates for pages in this directory.
 *
 * You can overwrite this by placing a home.ctp file inside app/views/wild_pages/home.ctp
 *
 * @package wildflower
 */
?>
	<div class="rightCol">
		<?php echo $wild->processWidgets($page['WildPage']['sidebar_content']); ?>
	</div>
	<div class="main">
		<h2><?php echo $page['WildPage']['title']; ?></h2>
		<?php echo $wild->processWidgets($page['WildPage']['content']); ?>
	</div>

	<?php echo $this->element('edit_this', array('id' => $page['WildPage']['id'])) ?>
