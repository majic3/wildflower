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
<div class="main">
	<div class="line">
		<?php echo $this->element('edit_this', array('id' => $page['WildPage']['id'])) ?>
		<div id="size3of4 unit">
			<h2><?php echo $page['WildPage']['title']; ?></h2>
			<?php echo $page['WildPage']['content']; ?>
		</div>

		<div id="size1of4 lastUnit">
			<?php echo $page['WildPage']['sidebar_content']; ?>
		</div>
	</div>
</div>