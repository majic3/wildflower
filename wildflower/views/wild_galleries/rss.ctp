<?php
	echo $rss->items($galleries, 'transformRSS');

	function transformRSS($element) {
	    $fullGalleryUrl = 'http://' . $_SERVER['HTTP_HOST'] . '/' . Configure::read('Wildflower.galleryIndex') . '/' . $element['WildGallery']['slug'];
		return array(
			'guid'  => $fullPostUrl,
			'pubDate' => $element['WildGallery']['created'],
			'description' => $element['WildGallery']['content'],
			'title' => hsc($element['WildGallery']['name']),
			'link' => $fullPostUrl,
		);
	}
