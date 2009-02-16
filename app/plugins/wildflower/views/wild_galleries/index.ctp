<div class="gallery index">
<h2><?php __('Galleries');?></h2>
<div id="header">
	<img src="<?php echo $album->preview->url; ?>" width="<?php echo $album->preview->width; ?>" height="<?php echo $album->preview->height; ?>" />
	<h1><?php echo $album->name ?></h1>
	<?php echo $director->utils->convert_line_breaks($album->description) ?>
</div>

<div id="images">
		<?php foreach ($contents as $image): ?>
			<a href="<?php echo $image->large->url ?>" rel="lightbox[road]" title="Uploaded by <?php echo $image->creator->display_name; ?>"><img src="<?php echo $image->thumb->url ?>" width="<?php echo $image->thumb->width ?>" height="<?php echo $image->thumb->height ?>" alt="" /></a>
		<?php endforeach;
		
		echo json_encode($flickr);

		    $person = $flickr->people_findByUsername('Majic 3');
 
    // Get the friendly URL of the user's photos
    $photos_url = $flickr->urls_getUserPhotos($person['id']);

 
    // Get the user's first 36 public photos
    $photos = $flickr->people_getPublicPhotos($person['id'], NULL, 36);
 	
        $i = 1;
    // Loop through the photos and output the html
    foreach ((array)$photos['photos']['photo'] as $photo) {
        echo "<a href=\"{$flickr->buildPhotoURL($photo, 'large')}\">";
        echo "<img border='0' alt='$photo[title]' ". //>
            "src='" . $flickr->buildPhotoURL($photo, "thumbnail") . "' />";
        echo "</a>";
        $i++;
        // If it reaches the sixth photo, insert a line break
        if ($i % 6 == 0) {
            echo "<br />n";
        }
    }

		?>
		
</div>
<table cellpadding="0" cellspacing="0">
<tr>
	<th><?php echo $paginator->sort('id');?></th>
	<th><?php echo $paginator->sort('slug');?></th>
	<th><?php echo $paginator->sort('name');?></th>
	<th><?php echo $paginator->sort('type');?></th>
	<th><?php echo $paginator->sort('params');?></th>
	<th class="actions"><?php __('Actions');?></th>
</tr>
<?php
$i = 0;
foreach ($galleries as $gallery):
	$class = null;
	if ($i++ % 2 == 0) {
		$class = ' class="altrow"';
	}
?>
	<tr<?php echo $class;?>>
		<td>
			<?php echo $gallery['WildGallery']['id']; ?>
		</td>
		<td>
			<?php echo $gallery['WildGallery']['slug']; ?>
		</td>
		<td>
			<?php echo $gallery['WildGallery']['name']; ?>
		</td>
		<td>
			<?php echo $gallery['WildGallery']['type']; ?>
		</td>
		<td>
			<?php echo $gallery['WildGallery']['params']; ?>
		</td>
		<td class="actions">
			<?php echo $html->link(__('View', true), '/' . Configure::read('Wildflower.galleryView') . '/' . $gallery['WildGallery']['slug'] . '/'); ?>
		</td>
	</tr>
<?php endforeach; ?>
</table>
</div>