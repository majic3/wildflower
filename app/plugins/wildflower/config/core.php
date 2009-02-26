<?php
/**
 * Wildflower plugin core configuration
 *
 * This file is automatically loaded by WF's bootstrap.php.
 * 
 * @package wildflower
 */

/** Constant used in CmsHelper */
define('CHILD_PAGES_PLEASE', 'CHILD_PAGES_PLEASE');

/** Wildflower cache path */
define('WILDFLOWER_CACHE', WILDFLOWER_PLUGIN . DS . 'tmp' . DS . 'cache');

/** Wildflower config. Access like Configure::read('Wildflower.settingName'); */
Configure::write(array('Wildflower' => array(
    'cookie' => array(
        'name' => 'WildflowerUser',
        'expire' => 2592000,
    ),
    'gzipOutput' => true,
    'uploadsDirectoryName' => 'uploads',
    'uploadDirectory' => APP . WEBROOT_DIR .  DS . 'uploads', // @TODO rename the key
    'prefix' => 'wf',
    'rootPageCache' => CACHE . 'wf_root_pages',
    'previewCache' => CACHE . 'wf_previews' . DS,
    'thumbnailsCache' => WILDFLOWER_CACHE . DS . 'wf_thumbnails',
    'postsParent' => 'post',
    'blogName' => 'posts',	 
    'blogIndex' => 'posts',	 
    'galleryDirectoryName' => 'img/gallery',
    'galleryDirectory' => APP . WEBROOT_DIR .  DS . 'img/gallery', // @TODO rename the key
    'galleryName' => 'media',
    'galleryView' => 'media/view',
    'galleryShow' => 'media/show',
    'galleryIndex' => 'media',
    // Disabling the root page cache may be useful in debugging 
    // (the cache file won't be created, page routes load from the database)
    'disableRootPageCache' => false,
)));

// flickr - 0.1a
Configure::write(array('Flickr' => array(
	'userID' => 'your uid',
	'secret' => 'your-secret',
	'api_key' => 'your-key',
	'cache' => CACHE . 'flickr',
)));

// slideshowpro director - 0.1a
Configure::write(array('Director' => array(
	'api_key' => 'your-api-key',
	'path' => 'your-api-path',
	'cache' => CACHE . 'Director',
)));

// icing config 0.6
Configure::write(array('Icing' => array(
	'version' => '0.6.9',
    'dashboardFeeds' => array(
		array(
        'name' => 'Wildlfower',
        'url' => 'wf.wf.klevo.sk/feed'
		),
		array(
        'name' => 'CakePHP',
        'url' => 'bakery.cakephp.org/articles/rss'
		),
		array(
        'name' => 'jQuery',
        'url' => 'jquery.com/blog/feed/'
		)
	),
    'open_id' => array(
		'adminConfig' => array(
			'email' => 'youropenid@network.com'
		),
		'pubSettings' => array(
			'useOnComments' => false
		)
	),
    'gravatar' => array(
		'pubSettings' => array(
			'useOnComments' => false
		)
	),
    'gfeed' => array(
		'api' => ''
	),
    'webthumbs' => array(
		'thumb_url' => 'http://webthumb.bluga.net/easythumb.php',
		'user_id' => '1234',
		'api_key' => 'replace0this0with0your0key000000', 
		'default_size' => 'medium2', 
		'default_cache' => '-1'
    )
)));

if(strpos($_SERVER['HTTP_HOST'], '.ss29') == true)
include('icing.core.php');
