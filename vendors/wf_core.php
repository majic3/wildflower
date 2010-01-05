<?php
/**
 * Wildflower plugin core configuration
 *
 * This file should be included in app/bootsrap.php.
 * 
 * @package wildflower
 */

/** Constant used in CmsHelper @depracated */
define('CHILD_PAGES_PLEASE', 'CHILD_PAGES_PLEASE');

/** Site Domain */
define('SITE_DOMAINN', 'majic.wildflower.ss29');
define('SITE_DOMAIN', 'www.' . SITE_DOMAINN);
define('CDN_DOMAIN', 'http://' . SITE_DOMAINN); // later 

/** Wildflower config. Access like Configure::read('Wildflower.setting'); */
Configure::write(array('Wildflower' => array(
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
    'cakeLogs' => CACHE . '..' . DS . 'logs',
    'backups' => 'l:' .  DS . 'vhost-backups' .  DS . 'wildflower',
	'staticCache' => APP . WEBROOT_DIR .  DS . 'cache',
    'postsParent' => 'p',	// view individual posts
    'blogName' => 'Posts',	// used in the route for the blog
    'blogIndex' => 'posts',	// the name of the blog
    'shorturl' => CDN_DOMAIN . '/s', // without pref with out www. or a different subdomain if possible
    'puburl' => 'http://'.SITE_DOMAIN, // public url where main files are served
    // Disabling the root page cache may be useful in debugging 
    // (the cache file won't be created, page routes load from the database)
    'disableRootPageCache' => false,
	'mediaRoute' => 'i',
    // 60000% speed increase with pure HTML caching into the webroot
    // @TODO cache expire not implemented yet, so don't use if you can't get around it
	'htmlCache' => false,
	
    'units' => array(  // idea is that general will be used within sites and other such things (where they may include relational data from addition general is prime stuff additional is supplementary)
        'general' => array('pages', 'posts', 'categories', 'profiles'),
        'additional' => array('dashboards', 'users', 'comments', 'assets', 'messages', 'uploads', 'settings', 'utilities', 'status', 'widgets', 'sidebars', 'menus', 'menu_items', 'links', 'shorts', 'sitemaps')
    ),

	// sitemap data presets
	'sitemapData' => array(
		'defaults' => Array(
			'home' => Array(
				'changefreq' => 'weekly',
				'pr' => '0.8'
			),
			'Page' => Array(
				'changefreq' => 'never',
				'pr' => '0.4'
			),
			'Post' => Array(
				'changefreq' => 'daily',
				'pr' => '0.9'
			),
			'Categories' => Array(
				'changefreq' => 'yearly',
				'pr' => '0.7'
			),
			'Contact' => Array(
				'changefreq' => 'never',
				'pr' => '0.9'
			)
		),
        'units' => array('pages', 'posts', 'categories'),
	),
    'version' => '1.3b4-db7',
)));


//Configure::write('debug', 1);
