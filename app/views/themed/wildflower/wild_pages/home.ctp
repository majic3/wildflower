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
		<div id="twitter" class="mod">
			<div class="inner">
				<div class="hd"><h3>twitter</h3></div>
				<div class="bd">body</div>
				<div class="ft"><a href="http://www.twitter.com/majic3">follow me on twitter</a></div>
			</div>
		</div>
		<hr />
		<?php echo $wild->processWidgets($page['WildPage']['sidebar_content']); ?>
	</div>
	<div class="main">
		<h2><?php echo $page['WildPage']['title']; ?></h2>
		<?php echo $wild->processWidgets($page['WildPage']['content']); ?>
	</div>

	<?php echo $this->element('edit_this', array('id' => $page['WildPage']['id'])) ?>
