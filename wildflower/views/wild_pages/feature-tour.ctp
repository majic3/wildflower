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
			<div class="size4of5 unit">
				
				<?php echo $html->link($html->img($page['WildPage']['custom_fields'][0]['value'], $html->img($page['WildPage']['custom_fields'][1]['value'])); ?>
				<h2><?php echo $page['WildPage']['title']; ?></h2>
				<?php echo $wild->processWidgets($page['WildPage']['content']); ?>
			</div>
			<div class="size1of5 lastUnit">
				<div id="twitter" class="mod basic">
					<b class="top"><b class="tl"></b><b class="tr"></b></b> 
					<div class="inner">
						<div class="hd"><h3>Sub Pages</h3></div>
						<div class="bd"><ul><li><a href="/feature-tour/jquery-ui">jquery ui</a></li></ul></div>
					</div>
					<b class="bottom"><b class="bl"></b><b class="br"></b></b>
				</div>
				<hr />
				<?php echo $wild->processWidgets($page['WildPage']['sidebar_content']); ?>
			</div>
		</div>
	</div>

	<?php echo $this->element('edit_this', array('id' => $page['WildPage']['id'])) ?>
