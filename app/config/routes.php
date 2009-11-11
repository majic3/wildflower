<?php
/**
 * Wildflower routes
 *
 * Wildflower reserves these URL's:
 */
 
// Home page
Router::connect('/', array('controller' => 'pages', 'action' => 'view'));
Router::connect('/app/webroot/', array('controller' => 'pages', 'action' => 'view'));

// Posts section
Router::connect('/feed', array('controller' => 'posts', 'action' => 'rss'));
Router::connect('/' . Configure::read('Wildflower.blogIndex'), array('controller' => 'posts', 'action' => 'index'));
Router::connect('/' . Configure::read('Wildflower.blogIndex') . '/*', array('controller' => 'posts', 'action' => 'index'));
Router::connect('/' . Configure::read('Wildflower.postsParent') . '/:slug', array('controller' => 'posts', 'action' => 'view'));
Router::connect('/' . Configure::read('Wildflower.catsParent') . '/:slug', array('controller' => 'posts', 'action' => 'category'));

// short urls
$short = Configure::read('Wildflower.shorturl');
$short = substr($short, strrpos($short, '/'), strlen($short));
Router::connect($short . '/:slug/*', array('controller'=>'shorts', 'action'=>'retrive'), array('slug'=>'[a-zA-Z0-9\\-]+'));


// Wildflower admin routes
$prefix = Configure::read('Routing.admin');
Router::connect("/$prefix", array('controller' => 'dashboards', 'action' => 'index', 'admin' => true));

// Image thumbnails
// @TODO shorten to '/i/*'
Router::connect('/wildflower/thumbnail/*', array('controller' => 'assets', 'action' => 'thumbnail'));
Router::connect('/wildflower/thumbnail_by_id/*', array('controller' => 'assets', 'action' => 'thumbnail_by_id'));


// Site search (pages & posts)
Router::connect('/search', array('controller' => 'dashboards', 'action' => 'search'));

// sitemaps - new improved sitemap - statically cached and able to gen full maps + intergrates with Yahoo, Google, Ask & Bing
Router::connect('/sitemap', array('controller' => 'sitemaps', 'action' => 'index'));
Router::connect('/sitemap.xml', array('controller' => 'sitemaps', 'action' => 'index'));
Router::connect('/sitemap/:action/*', array('controller' => 'sitemaps'));

// robots.txt
Router::connect('/robots.txt', array('controller' => 'sitemaps', 'action' => 'robots'));
Router::connect('/robots', array('controller' => 'sitemaps', 'action' => 'robots'));

// parseextension xml for sitemap
Router::parseExtensions('rss','xml', 'txt', 'json'); 

// Connect root pages slugs
App::import('Vendor', 'WfRootPagesCache', array('file' => 'WfRootPagesCache.php'));
WildflowerRootPagesCache::connect();


/**
 * Your routes here...
 */
