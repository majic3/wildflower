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

/** Site Domain */
define('SITE_DOMAINN', 'majic.wildflower.ss29');
define('SITE_DOMAIN', 'www.' . SITE_DOMAINN);
define('CDN_DOMAIN', 'http://' . SITE_DOMAINN); // later 

/** Wildflower config. Access like Configure::read('Wildflower.settingName'); */
Configure::write(array('Wildflower' => array(
	// set cookie with domain minus the www (aiming to have static media requested w/cookie data)
    'cookie' => array(
        'name' => 'WildflowerUser',
        'expire' => 2592000,
        'domain' => SITE_DOMAIN,
    ),
    'gzipOutput' => true,
    'uploadsDirectoryName' => 'uploads',
    'uploadDirectory' => APP . WEBROOT_DIR .  DS . 'uploads', // @TODO rename the key
    
    'rootPageCache' => CACHE . 'wf_root_pages',
    'previewCache' => CACHE . 'wf_previews',
    'thumbnailsCache' => CACHE . 'wf_thumbnails',
    'blogName' => 'Posts',
    'postsParent' => 'p',
    'blogIndex' => 'posts',
    'blogExerpt' => 'exerpt', // classname that wraps content of posts for display on index

	// adding settings for shorts
    'shorturl' => CDN_DOMAIN . '/s', // without pref with out www. or a different subdomain if possible
    'puburl' => 'http://'.SITE_DOMAIN, // public url where main files are served

	// sitemap data presets - this can be overwritten with page params + posts belong longing to cats can have different pr
	'sitemapData' => array(
		'defaults' => Array(
			'Page' => Array(
				'changefreq' => 'never',
				'pr' => '0.4'
			),
			'Post' => Array(
				'changefreq' => 'daily',
				'pr' => '0.8'
			)
		)
	),	
    'units' => array(  // needed for now for sitemaps better way to do this though
        'general' => array('pages', 'posts', 'categories'),
        'additional' => array('dashboards', 'users', 'comments', 'assets', 'messages', 'uploads', 'settings', 'utilities', 'widgets', 'sidebars', 'menus', 'menu_items', 'shorts', 'sitemaps')
    ), 

    // Disabling the root page cache may be useful in debugging 
    // (the cache file won't be created, page routes load from the database)
    'disableRootPageCache' => false,
    
	// 60000% speed increase with pure HTML caching into the webroot
    // @TODO cache expire not implemented yet, so don't use if you can't get around it
    'htmlCache' => false,
	'wfControllers' => array('pages', 'posts', 'dashboards', 'users', 'categories', 'comments', 'assets', 'messages', 'uploads', 'settings', 'utilities', 'widgets', 'shorts', 'sidebars', 'interactive', 'sitemaps', 'menus', 'menu_items'),

    // version number of wildflower codebase
    'version' => '1.3b-b2c',
    'debug' => array('admin' => true, 'public' => true), // this is handy and seems fine; but I do wonder
)));

// cake plugins
// asset (modifed by me only slightly)
Configure::write('Asset.jsPath', 'cjs');
Configure::write('Asset.cssPath', 'ccss');
