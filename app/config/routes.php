<?php
/**
 * Load my_routes.php first, so user routes have priority over Wildflower
 *
 * To add your custom routes, create file my_routes.php in this folder and add them there. When you update Wildflower you won't have to  merge this file with a new version.
 */
$myRoutesPath = dirname(__FILE__) . DS . 'my_routes.php';
if (file_exists($myRoutesPath)) {
	require_once($myRoutesPath);
}

/**
 * Wildflower routes
 *
 * Wildflower reserves these URL's:
 */
 
// Home page
Router::connect('/', array('controller' => 'pages', 'action' => 'view'));
Router::connect('/app/webroot/', array('controller' => 'pages', 'action' => 'view'));

// Contact form
Router::connect('/contact', array('controller' => 'messages', 'action' => 'index'));
Router::connect('/contact/create', array('controller' => 'messages', 'action' => 'create'));

// Search, help & options
Router::connect('/search', array('controller' => 'dashboards', 'action' => 'search'));
Router::connect('/help', array('controller' => 'dashboards', 'action' => 'help'));
Router::connect('/options', array('controller' => 'dashboards', 'action' => 'options'));

// Posts section
Router::connect('/rss', array('controller' => 'posts', 'action' => 'rss'));
Router::connect('/' . Configure::read('Wildflower.blogIndex'), array('controller' => 'posts', 'action' => 'index'));
Router::connect('/' . Configure::read('Wildflower.blogIndex') . '/*', array('controller' => 'posts', 'action' => 'index'));
Router::connect('/' . Configure::read('Wildflower.postsParent') . '/:slug', array('controller' => 'posts', 'action' => 'view'));
Router::connect('/c/:slug', array('controller' => 'posts', 'action' => 'category'));

// Wildflower admin routes
$prefix = Configure::read('Routing.admin');
Router::connect("/$prefix", array('controller' => 'dashboards', 'action' => 'index', 'admin' => true));

// Image thumbnails
// @TODO shorten to '/i/*'
$mprefix = Configure::read('Wildflower.mprefix');
Router::connect('/' . $mprefix. '/thumbnail/*', array('controller' => 'assets', 'action' => 'thumbnail'));
Router::connect('/' . $mprefix. '/thumbnail_by_id/*', array('controller' => 'assets', 'action' => 'thumbnail_by_id'));

// Utilities - add for cache and other general bits and things

// sitemaps
Router::connect('/sitemap', array('controller' => 'sitemaps', 'action' => 'index'));
Router::connect('/sitemap/:action/*', array('controller' => 'sitemaps'));

// sitemaps - robots optional
Router::connect('/robots/:action/*', array('controller' => 'sitemaps', 'action' => 'robots'));

// Connect root pages slugs
App::import('Vendor', 'WfRootPagesCache', array('file' => 'WfRootPagesCache.php'));
WildflowerRootPagesCache::connect();

Router::parseExtensions(); 