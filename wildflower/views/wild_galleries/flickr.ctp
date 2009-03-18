<?php
		
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
    } ?>