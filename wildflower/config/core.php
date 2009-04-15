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
define('WILDFLOWER_CACHE', WILDFLOWER_DIR . DS . 'tmp' . DS . 'cache');

/** Wildflower config. Access like Configure::read('Wildflower.settingName'); */
Configure::write(array('Wildflower' => array(
    'cookie' => array(
        'name' => 'WildflowerUser',
        'expire' => 2592000,
    ),
    'gzipOutput' => true,
    'uploadsDirectoryName' => 'img/cms',
    'uploadDirectory' => APP . WEBROOT_DIR . DS . 'img' . DS . 'cms', // @TODO rename the key
    'prefix' => 'wf',
    'rootPageCache' => CACHE . 'wf_root_pages',
    'previewCache' => CACHE . 'wf_previews',
    'thumbnailsCache' => CACHE . 'wf_thumbnails',
    'postsParent' => 'post',
    'blogName' => 'posts',	 
    'blogIndex' => 'posts',
    // Disabling the root page cache may be useful in debugging 
    // (the cache file won't be created, page routes load from the database)
    'disableRootPageCache' => false
)));

// system admin user with this login can reset & ad
Configure::write(array('System' => array(
	'adminUser' => array(
		'admin'
	),
	'adminCustomSettings' => array('general', 'themes', 'director', 'posts')
)));

// slideshowpro director - 0.1a
Configure::write(array('themes' => array(
	array('public' => 'wildflower', 'text', 'theme use by wf'),
)));

// slideshowpro director - 0.1a
Configure::write(array('director' => array(
	array('api-key', 'your-api-key', 'text', 'director API key'),
	array('path', 'your-api-path', 'text', 'director API path'),
	array('cache', CACHE . 'Director', 'text', 'director API cache'),
)));

// icing config 0.7 - tidying up and reviewing everything (entire set of modifications reviewed)
Configure::write(array('Icing' => array(
	'version' => '0.7.0',
    'dashboardFeeds' => array(
		array(
        'url' => 'wf.klevo.sk/posts/feed',
        'name' => 'Wildflower',
		),
		array(
        'name' => 'CakePHP',
        'url' => 'bakery.cakephp.org/articles/rss'
		),
		array(
        'name' => 'jQuery',
        'url' => 'jquery.com/blog/feed/'
		),
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

Configure::write('debug', 0);