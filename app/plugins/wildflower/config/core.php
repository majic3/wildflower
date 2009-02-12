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
    'postsParent' => 'p',
    'blogIndex' => 'posts',
    // Disabling the root page cache may be useful in debugging 
    // (the cache file won't be created, page routes load from the database)
    'disableRootPageCache' => false,
)));

// icing config 0.6
Configure::write(array('Icing' => array(
	'version' => '0.6.5',
	'prefix' => '',
	'assets' => array(
		'adminScripts' => array(
			'jquery-ui',
			'common'
		),
		'adminStyles' => array(
			'boilerplate',
			'plugins',
			'admin',
			'glass/ui.all.css'
		), 
		'scripts' => array(
			'jquery', 
			'swfobject', 
			'jquery-ui', 
			'jquery.jScrollPane',
			'jquery.form', 
			'jquery.tipsy', 
			'jquery.blockui', 
			'jquery.growl', 
			'jquery.easing',
			'shadowbox', 
			'common'
		),
		'styles' => array(
			'boilerplate.css', 
			'plugins.css', 
			'tipsy.css', 
			'jscrollpane.css', 
			'growl.css', 
			'iscreen.css'
		),
	),
	'compress' => array(
		'js' => 'force',
		'css' => 'force'
	),
    'dashboardFeeds' => array(
		array(
        'name' => 'Icing',
        'url' => 'icing.majic3.com/feed'
		),
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
    )
)));
