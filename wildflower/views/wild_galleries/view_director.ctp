
<div id="header">
	<img src="<?php echo $album->preview->url; ?>" width="<?php echo $album->preview->width; ?>" height="<?php echo $album->preview->height; ?>" />
	<h1><?php echo $album->name ?></h1>
	<?php echo $director->utils->convert_line_breaks($album->description) ?>
</div>

<div id="images">
		<?php foreach ($contents as $image): ?>
			<a href="<?php echo $image->large->url ?>" rel="shadowbox" title="Uploaded by <?php echo $image->creator->display_name; ?>"><img src="<?php echo $image->thumb->url ?>" width="<?php echo $image->thumb->width ?>" height="<?php echo $image->thumb->height ?>" alt="" /></a>
		<?php endforeach;	?>
		
</div>