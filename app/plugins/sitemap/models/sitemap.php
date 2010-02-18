<?php
class Sitemap extends SitemapAppModel {

	var $name = 'Sitemap';
	var $actsAs = array(
		'Slug' => array('separator' => '-', 'overwrite' => false, 'label' => 'title')
	);

}
?>