<?php
/**
 * Wildflower generic page template.
 *
 * @package wildflower
 */
 
$mprefix = Configure::read('Wildflower.mediaRoute');
?>
<div class="rightCol">
	<?php print_r($args);?>

	<div class="mod">
		<?php
			if(is_array($images))	{
				foreach($images['Asset'] as $Asset)	{
					$galleryNav[$Asset['name']] = '/g/album/' . $Asset['id'];
				}
				//debug($galleryNav);
				//*
				echo $navigation->create($galleryNav, array(
				'id' => 'galleryThumbs',
				'class' => 'thumbs',
				'itemTemplate' => '<li%attr%><a href="%url%"><img src="/i/thumbnail/%name%/100/100/1" width="100" height="100" /></a></li>',
				'activeItemTemplate' => '<li%attr%><a href="%url%" title="%name%"><img src="/i/thumbnail/%name%/100/100/1" width="100" height="100" /></a></li>',
				'activeCssClass' => 'current',
				'before' => '<ul%attr%>',
				'after' => '</ul>'));
				//*/
			} else {
				$navigation->create($categories);
			}
		?>
	</div>

	<div class="mod">
		<?php
			echo $this->element('tag_cloud');
		?>
	</div>

</div>
<div class="main">
	<?php 
		if(isset($images)):
			if(isset($image)):	?>
			
			<h2><?php echo $image['Asset']['title']; ?></h2>
			
			<div class="media"><?php
				echo $html->image("/uploads/{$image['Asset']['name']}/650");
			?></div>
		
			<div><a href="/gallery/">gallery index</a></div>
		
			<?php	else:	?>
		
			<h2><?php
				$galleryTitle = (isset($galleryTitle)) ? $galleryTitle : 'Gallery'; 
				$galleryUrl = '/gallery' . (isset($cat) ? '/' . $cat : '');
				echo $html->link($galleryTitle, $galleryUrl);	?></h2>


			<div class="line nolast">
				<?php
					foreach($files as $file):
						$iurl = '/g/album/' . $file['Asset']['id'];
				?>
				<div class="unit size1of4">
					<h3><?php	echo $html->link($file['Asset']['title'], $iurl);	?></h3>

					<div class="thumb">
					<?php
						echo $html->link($html->image("/$mprefix/thumbnail/{$file['Asset']['name']}/150/150/1", array('width' => '150', 'height' => '150')), $iurl, array(), false, false);
					?>
					</div>
				</div>
				<?php
				endforeach;
				echo $this->element('pagination');
			endif;
		else:
	?><h2><?php
		$galleryTitle = (isset($galleryTitle)) ? $galleryTitle : 'Gallery'; 
		$galleryUrl = '/gallery' . (isset($cat) ? '/' . $cat : '');
		echo $html->link($galleryTitle, $galleryUrl);
	?></h2>
	<div class="line nolast">
		<?php
			foreach($files as $file):
			$iurl = '/g/album/' . $file['Asset']['id'];	?>
		<div class="unit size1of4">
			<h3><?php	echo $html->link($file['Asset']['title'], $iurl);	?></h3>
			<div class="thumb">
				<?php
					echo $html->link($html->image("/$mprefix/thumbnail/{$file['Asset']['name']}/150/150/1", array('width' => '150', 'height' => '150')), $iurl, array(), false, false);
				?>
			</div>
		</div>
		<?php
			endforeach;
			echo $this->element('pagination');
		endif;
		?>
	</div>
</div>

