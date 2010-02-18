<?php
/**
 * Wildflower generic page template.
 *
 * @package wildflower
 */
?>
</div>
<div class="body">
	<div class="main">
		<div id="myContentWrapper" class="size1of3 unit">
			<?php 
				echo $swfobject->staticObject('myContent', 'my content');
			?>
		</div>
		
		<div id="myContent2Wrapper" class="size1of3 unit">
			<div id="myContent2">
				<p>alternate content which gets replaced by swf embedded by swfObject</p>
			</div>
		</div>
		
		<div id="myContent3Wrapper" class="size1of3 unitLast">
			<object id="myContent3" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="300" height="120">
				<param name="movie" value="/swf/test.swf" />
				<param name="menu" value="false" />
				<param name="wmode" value="transparent" />
				<param name="flashvars" value="name1=hello&amp;name2=world&amp;name3=foobar" />
				<!--[if !IE]>-->
				<object type="application/x-shockwave-flash" data="/swf/test.swf" width="300" height="120">

					<param name="menu" value="false" />
					<param name="wmode" value="transparent" />
					<param name="flashvars" value="name1=hello&amp;name2=world&amp;name3=foobar" />
				<!--<![endif]-->
				<div>
					<h1>Alternative content</h1>
					<p><a href="http://www.adobe.com/go/getflashplayer"><img src="http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif" alt="Get Adobe Flash player" /></a></p>
				</div>

				<!--[if !IE]>-->
				</object>
				<!--<![endif]-->
			</object>

			<p>plain test</p>
		</div>
	</div>
<?php
if(isset($aside_for_layout)): ?>
	<div class="leftCol">
	<?php echo $aside_for_layout; ?>
	</div>
<?php endif; ?>
<div class="rightCol">
	<div class="line">
		<div class="unit size1of1">
			<?php echo $this->element('latest_posts');  ?>
		</div>
		<div class="unit size1of2">
			<h3>Latest Comments</h3>
			<?php echo $wild->menu('latestComments', array());  ?>
		</div>
		<div class="lastUnit size1of2">
			<h3>Categories</h3>
			<?php echo $wild->menu('dynamicCats', array());  ?>
		</div>
	</div>
	<?php if(isset($sidebar_for_layout)) echo $sidebar_for_layout;  ?>
</div>
<div class="main">
	<h2><?php echo $page['Page']['title']; ?></h2>

	<div class="entry">
		<?php echo $page['Page']['content']; ?>
	</div>

	<?php echo $this->element('edit_this', array('id' => $page['Page']['id'])) ?>
</div>

