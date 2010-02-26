-- phpMyAdmin SQL Dump
-- version 3.1.4
-- http://www.phpmyadmin.net
--
-- Host: localhost:3306
-- Generation Time: Feb 26, 2010 at 02:17 AM
-- Server version: 5.1.34
-- PHP Version: 5.3.1RC2

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";

--
-- Database: `wildflower_majic_github`
--

-- --------------------------------------------------------

--
-- Table structure for table `assets`
--

CREATE TABLE IF NOT EXISTS `assets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `mime` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `data` text COLLATE utf8_unicode_ci,
  `category_id` int(11) DEFAULT NULL,
  `created` datetime NOT NULL,
  `updated` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `mime` (`mime`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=15 ;

--
-- Dumping data for table `assets`
--


-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE IF NOT EXISTS `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_id` int(11) DEFAULT NULL,
  `lft` int(11) DEFAULT NULL,
  `rght` int(11) DEFAULT NULL,
  `slug` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `parent_id` (`parent_id`),
  KEY `tree_left` (`lft`),
  KEY `tree_right` (`rght`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=76 ;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `parent_id`, `lft`, `rght`, `slug`, `title`, `description`) VALUES
(58, 57, 8, 9, 'sci-fi', 'Sci-fi', NULL),
(70, 57, 12, 13, 'love-poetry', 'Love Poetry', NULL),
(54, 53, 2, 3, 'action', 'Action', NULL),
(56, NULL, 5, 6, 'cooking', 'Cooking', NULL),
(57, NULL, 7, 12, 'books', 'Books', NULL),
(53, NULL, 1, 4, 'movies', 'Movies', NULL),
(61, NULL, 13, 26, 'assets', 'Assets', NULL),
(62, 61, 14, 15, 'image', 'Image', ''),
(71, 61, 16, 17, 'swf', 'swf', NULL),
(72, 61, 18, 25, 'galleries', 'galleries', NULL),
(73, 72, 19, 20, 'gallery-one', 'gallery one', NULL),
(74, 72, 21, 22, 'gallery-three', 'gallery three', NULL),
(75, 72, 23, 24, 'gallery-two', 'gallery two', '');

-- --------------------------------------------------------

--
-- Table structure for table `categories_posts`
--

CREATE TABLE IF NOT EXISTS `categories_posts` (
  `category_id` int(11) DEFAULT NULL,
  `post_id` int(11) DEFAULT NULL,
  KEY `category_id` (`category_id`,`post_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `categories_posts`
--

INSERT INTO `categories_posts` (`category_id`, `post_id`) VALUES
(56, 60),
(57, 56),
(57, 60),
(59, 49),
(59, 52);

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE IF NOT EXISTS `comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `post_id` int(11) DEFAULT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `email` char(80) COLLATE utf8_unicode_ci NOT NULL,
  `url` char(80) COLLATE utf8_unicode_ci DEFAULT NULL,
  `content` text COLLATE utf8_unicode_ci NOT NULL,
  `spam` tinyint(1) NOT NULL DEFAULT '0',
  `created` datetime NOT NULL,
  `updated` datetime NOT NULL,
  `approved` int(11) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `post_id` (`post_id`),
  KEY `spam` (`spam`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=17 ;

--
-- Dumping data for table `comments`
--


-- --------------------------------------------------------

--
-- Table structure for table `groups`
--

CREATE TABLE IF NOT EXISTS `groups` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` text,
  `created` datetime DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=6 ;

--
-- Dumping data for table `groups`
--

INSERT INTO `groups` (`id`, `name`, `created`, `modified`) VALUES
(1, 'dev', '2009-03-19 15:39:50', '2009-03-19 15:39:50'),
(2, 'admin', '2009-03-19 15:44:30', '2009-03-19 15:44:30'),
(3, 'registered', '2009-03-19 15:44:50', '2009-03-19 15:44:50'),
(4, 'member', '2009-03-19 15:45:02', '2009-03-19 15:45:02'),
(5, 'anonymous', '2009-03-19 15:45:15', '2009-03-19 15:45:15');

-- --------------------------------------------------------

--
-- Table structure for table `menus`
--

CREATE TABLE IF NOT EXISTS `menus` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `slug` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=2 ;

--
-- Dumping data for table `menus`
--

INSERT INTO `menus` (`id`, `title`, `slug`) VALUES
(1, 'Main menu', 'Main_menu');

-- --------------------------------------------------------

--
-- Table structure for table `menu_items`
--

CREATE TABLE IF NOT EXISTS `menu_items` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `menu_id` int(11) DEFAULT NULL,
  `label` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `url` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `order` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=9 ;

--
-- Dumping data for table `menu_items`
--

INSERT INTO `menu_items` (`id`, `menu_id`, `label`, `url`, `order`) VALUES
(1, 1, 'Download', '/', 0),
(2, 1, 'News', '/blog', 1),
(3, 1, 'Documentation', '/documentation', 2),
(4, 1, 'API', '/api', 4),
(5, 1, 'Source Code', 'http://github.com/klevo/wildflower/tree/master', 5),
(6, 1, 'Donate', '/donate', 6),
(7, 1, 'Contact Us', '/contact', 7),
(8, 1, 'Gallery', '/gallery', 3);

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE IF NOT EXISTS `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `phone` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `content` text COLLATE utf8_unicode_ci,
  `created` datetime NOT NULL,
  `updated` datetime NOT NULL,
  `subject` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `spam` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Stores all contact form communication' AUTO_INCREMENT=2 ;

--
-- Dumping data for table `messages`
--


-- --------------------------------------------------------

--
-- Table structure for table `models_tags`
--

CREATE TABLE IF NOT EXISTS `models_tags` (
  `id` char(36) NOT NULL,
  `tag_id` char(36) NOT NULL,
  `model` varchar(100) DEFAULT NULL,
  `model_id` char(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `tag_id` (`tag_id`),
  KEY `model__model_id` (`model`,`model_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Dumping data for table `models_tags`
--


-- --------------------------------------------------------

--
-- Table structure for table `pages`
--

CREATE TABLE IF NOT EXISTS `pages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_id` int(11) DEFAULT NULL,
  `lft` int(11) DEFAULT NULL,
  `rght` int(11) DEFAULT NULL,
  `level` int(3) NOT NULL DEFAULT '0' COMMENT 'Page level in the tree hierarchy',
  `slug` varchar(255) COLLATE utf8_unicode_ci NOT NULL COMMENT 'URL friendly page name',
  `url` varchar(255) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Full URL relative to root of the application',
  `title` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `content` text COLLATE utf8_unicode_ci,
  `description_meta_tag` text COLLATE utf8_unicode_ci,
  `keywords_meta_tag` text COLLATE utf8_unicode_ci,
  `draft` tinyint(1) NOT NULL DEFAULT '0',
  `created` datetime NOT NULL,
  `updated` datetime NOT NULL,
  `sidebar_content` text COLLATE utf8_unicode_ci,
  `user_id` int(11) DEFAULT NULL,
  `custom_fields` text COLLATE utf8_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `parent_id` (`parent_id`),
  KEY `lft` (`lft`),
  KEY `rght` (`rght`),
  KEY `draft` (`draft`),
  FULLTEXT KEY `content` (`content`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=215 ;

--
-- Dumping data for table `pages`
--

INSERT INTO `pages` (`id`, `parent_id`, `lft`, `rght`, `level`, `slug`, `url`, `title`, `content`, `description_meta_tag`, `keywords_meta_tag`, `draft`, `created`, `updated`, `sidebar_content`, `user_id`, `custom_fields`) VALUES
(211, NULL, 3, 4, 0, 'api', '/api', 'API', '<h2>WildHelper</h2>\n<h3>menu($slug, $id = null)</h3>\n<p>bla bla</p>', NULL, NULL, 0, '2009-06-28 19:14:16', '2009-06-28 19:16:08', NULL, 1, NULL),
(212, NULL, 5, 6, 0, 'documentation', '/documentation', 'Documentation', '<p>No docs here. Buhaha.</p>', NULL, NULL, 0, '2009-06-29 19:07:22', '2010-02-04 13:54:01', NULL, 1, NULL),
(210, NULL, 1, 2, 0, 'home', '/home', 'Wildflower is a CakePHP content management system', '<p>The aim is to remove all unnecessary features of a modern CMS and provide the most effective and simple way to manage a website.</p>\n<p>The foundation of a rapid development framework CakePHP allows developers to build any features specific to their project quickly and effectively.</p>', NULL, NULL, 0, '2009-06-28 18:15:30', '2009-06-28 18:52:54', NULL, 1, NULL),
(213, NULL, 7, 8, 0, 'contact', '/contact', 'Contact', '', NULL, NULL, 0, '2009-12-18 15:13:23', '2009-12-18 15:13:32', NULL, 1, NULL),
(214, NULL, 9, 10, 0, 'donate', '/donate', 'Donate', '<p>Donate at <a href="http://pledgie.com/campaigns/6043">Pledgie</a>.</p>', NULL, NULL, 0, '2010-02-04 13:54:36', '2010-02-04 13:55:05', NULL, 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `pages_sidebars`
--

CREATE TABLE IF NOT EXISTS `pages_sidebars` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `page_id` int(11) DEFAULT NULL,
  `sidebar_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=1 ;

--
-- Dumping data for table `pages_sidebars`
--


-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE IF NOT EXISTS `posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `slug` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `content` text COLLATE utf8_unicode_ci,
  `user_id` int(11) DEFAULT NULL,
  `description_meta_tag` text COLLATE utf8_unicode_ci,
  `keywords_meta_tag` text COLLATE utf8_unicode_ci,
  `created` datetime NOT NULL,
  `updated` datetime NOT NULL,
  `draft` int(1) NOT NULL DEFAULT '0',
  `archive` tinyint(1) NOT NULL DEFAULT '0',
  `uuid` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `comments_closed` int(1) NOT NULL DEFAULT '0',
  `comments_allowed` int(1) NOT NULL DEFAULT '0',
  `comment_count` int(11) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  FULLTEXT KEY `content` (`content`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=64 ;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`id`, `slug`, `title`, `content`, `user_id`, `description_meta_tag`, `keywords_meta_tag`, `created`, `updated`, `draft`, `archive`, `uuid`, `comments_closed`, `comments_allowed`, `comment_count`) VALUES
(60, 'a-test-post', 'A test post', '<p>dasdasd</p>', 1, NULL, NULL, '2009-06-29 18:44:28', '2010-02-04 13:52:56', 0, 0, '755abcb0855fe16cc54f270e59a4efd6091783a9', 0, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `revisions`
--

CREATE TABLE IF NOT EXISTS `revisions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `node_id` int(11) NOT NULL,
  `content` text COLLATE utf8_unicode_ci NOT NULL,
  `revision_number` int(11) NOT NULL,
  `created` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `type` (`type`,`node_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=157 ;

--
-- Dumping data for table `revisions`
--


-- --------------------------------------------------------

--
-- Table structure for table `schema_info`
--

CREATE TABLE IF NOT EXISTS `schema_info` (
  `version` int(11) unsigned NOT NULL DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `schema_info`
--

INSERT INTO `schema_info` (`version`) VALUES
(28);

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE IF NOT EXISTS `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `value` text COLLATE utf8_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `type` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `label` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `order` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=21 ;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `name`, `value`, `description`, `type`, `label`, `order`) VALUES
(1, 'site_name', 'Wildflower', '', 'text', NULL, 1),
(2, 'description', 'A CakePHP CMS', '', 'textbox', NULL, 2),
(3, 'keywords', 'CakePHP, CMS, WildFlower', '', 'textbox', NULL, 3),
(4, 'home_page_id', '210', 'Page that will be shown when visiting the site root.', 'select', 'Home page', 4),
(5, 'contact_email', 'you@localhost', 'You`ll receive notifications when somebody posts a comment or uses the contact form on this email address.', 'text', 'Contact email address', 5),
(6, 'email_delivery', 'mail', NULL, 'select', NULL, 6),
(7, 'smtp_server', '', '', 'text', NULL, 7),
(8, 'smtp_username', '', '', 'text', NULL, 8),
(9, 'smtp_password', '', '', 'text', NULL, 9),
(10, 'wordpress_api_key', '', '', 'text', NULL, 10),
(11, 'google_analytics_code', '', '', 'textbox', NULL, 11),
(12, 'cache', 'off', NULL, 'select', 'Page and post caching', 12),
(13, 'approve_comments', '1', '', 'checkbox', 'Approve each comment before publishing it', 13),
(14, 'credits', 'Powered by <a href="http://wf.klevo.sk/">Wildflower</a>. Wildflower Logo designed by <a href="http://www.olivertreend.com/">Oliver Treend</a>', 'Site credits', 'textbox', NULL, 14),
(15, 'homepage_credits', '1', '', 'checkbox', 'Credits on homepage only', 15),
(16, 'theme', '', '', 'select', 'Theme', 16),
(17, 'Sitemap.utils', '/users/login,/users/register,/search,/help,/options', 'Sitemap utilities links', 'text', 'Sitemap Utility Links', 18),
(19, 'AssetCategoryId', '61', 'The category that groups asset sub cats', 'select', 'Asset Category Parent Id', 5),
(18, 'category_parent_id', '61', 'The parent category to use for all assets', 'select', 'Asset Category Parent', 4),
(20, 'GalleryCategoryId', '72', 'This Category groups galleries', 'select', 'Category Group for Galleries', 4);

-- --------------------------------------------------------

--
-- Table structure for table `sidebars`
--

CREATE TABLE IF NOT EXISTS `sidebars` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `content` text COLLATE utf8_unicode_ci,
  `created` datetime DEFAULT NULL,
  `updated` datetime DEFAULT NULL,
  `region` varchar(35) COLLATE utf8_unicode_ci DEFAULT NULL,
  `on_posts` int(11) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=2 ;

--
-- Dumping data for table `sidebars`
--

INSERT INTO `sidebars` (`id`, `title`, `content`, `created`, `updated`, `region`, `on_posts`) VALUES
(1, 'Test sidebar', '<p>Lorem ipsum.</p>', '2009-05-17 07:03:29', '2009-05-17 07:03:29', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `sitemaps`
--

CREATE TABLE IF NOT EXISTS `sitemaps` (
  `id` int(3) NOT NULL AUTO_INCREMENT,
  `slug` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `content` text CHARACTER SET utf8 COLLATE utf8_unicode_ci,
  `created` datetime NOT NULL,
  `updated` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  FULLTEXT KEY `content` (`content`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=3 ;

--
-- Dumping data for table `sitemaps`
--

INSERT INTO `sitemaps` (`id`, `slug`, `title`, `content`, `created`, `updated`) VALUES
(1, 'root', 'root', '<ul id="primaryNav" class="col4"> \r\n				<li id="home"><a href="/">Wildflower Sitemap</a></li> \r\n \r\n				<li>							<!-- STATICS not home --> \r\n							<ul> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/home">Wildflower is a CakePHP content management system</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/api">API</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/api/controllers">Controllers</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/api/models">models</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/api/helpers-2">helpers</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/documentation">Documentation</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/documentation/my-new-page-with-non-apphelper-slug-method-but-against-the-dry-convention">my new page with non-apphelper slug method - but against the DRY convention</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/features">features</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/features/sub-features">Sub Features</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/features/sub-features/some-wired-shite-some-new-stuff-added">Some wired shite &amp; Some new stuff added</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/features/plugins">Plugins</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/features/plugins/add-ons-for-plugins">Add-ons for Plugins</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/features/plugins/add-ons-for-plugins/very-deep-shite-here">very deep shite here</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/features/plugins/yet-another-plugin">Yet Another Plugin</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/features/plugins/mce-advanced-image-resizing">MCE Advanced Image Resizing</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/features/plugins/no-sleep-for-the-ambitious">NO! sleep for the ambitious</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/features/plugins/mce-advanced-image-resizing-part-4">MCE Advanced Image Resizing part 4</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/features/modules-sidebars-menus-oh-my">Modules - sidebars &amp; menus oh my</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/features/short-urls">short urls</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/features/flash-helper">Flash Helper</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/contact">Contact</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/wildflower-a-cms-in-kit-form">Wildflower - A Cms in Kit Form</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/creating-a-page-in-ie">Creating a page in IE</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/another-new-page-this-time-dry-but-will-it-work">Another new page this time DRY but will it work?</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/third-test-with-some-cruft-remvoed-unless-behaviors-have-no-acccess-to-appcontroller">third test with some cruft remvoed unless behaviors have no acccess to AppController</a>								</li> \r\n															<li> \r\n								<a href="/sitemap/dashboards/search">Search</a>								</li> \r\n														</ul> \r\n							<!-- /STATICS --> \r\n								\r\n				</li><li> \r\n						<!-- DYNAMIC General Units  --> \r\n					<ul>						<li> \r\n							<h4> \r\n							<a href="http://www.majic.wildflower.ss29/posts">Posts</a>							</h4> \r\n							<!--  Posts Unit  --> \r\n							<ul> \r\n															<li> \r\n									<a href="http://www.majic.wildflower.ss29/p/lizards">Lizards</a>								</li> \r\n								<!--  /Posts Unit  --> \r\n															<li> \r\n									<a href="http://www.majic.wildflower.ss29/p/cats">Cats</a>								</li> \r\n								<!--  /Posts Unit  --> \r\n															<li> \r\n									<a href="http://www.majic.wildflower.ss29/p/dogs">Dogs</a>								</li> \r\n								<!--  /Posts Unit  --> \r\n															<li> \r\n									<a href="http://www.majic.wildflower.ss29/p/bears">Bears</a>								</li> \r\n								<!--  /Posts Unit  --> \r\n															<li> \r\n									<a href="http://www.majic.wildflower.ss29/p/sharks-1">Sharks</a>								</li> \r\n								<!--  /Posts Unit  --> \r\n															<li> \r\n									<a href="http://www.majic.wildflower.ss29/p/eagle">Eagle</a>								</li> \r\n								<!--  /Posts Unit  --> \r\n															<li> \r\n									<a href="http://www.majic.wildflower.ss29/p/crocodiles">Crocodiles</a>								</li> \r\n								<!--  /Posts Unit  --> \r\n															<li> \r\n									<a href="http://www.majic.wildflower.ss29/p/the-taking-of-pelham-123">The Taking of Pelham 123</a>								</li> \r\n								<!--  /Posts Unit  --> \r\n															<li> \r\n									<a href="http://www.majic.wildflower.ss29/p/a-golden-post-here">a golden post here</a>								</li> \r\n								<!--  /Posts Unit  --> \r\n															<li> \r\n									<a href="http://www.majic.wildflower.ss29/p/a-silver-post">A Silver Post</a>								</li> \r\n								<!--  /Posts Unit  --> \r\n															<li> \r\n									<a href="http://www.majic.wildflower.ss29/p/wiki-on-git">Wiki on Git</a>								</li> \r\n								<!--  /Posts Unit  --> \r\n															<li> \r\n									<a href="http://www.majic.wildflower.ss29/p/testing-altered-readable-wysiwyg-content">Testing altered readable WYSIWYG content</a>								</li> \r\n								<!--  /Posts Unit  --> \r\n															<li> \r\n									<a href="http://www.majic.wildflower.ss29/p/progress">Signs of Brilliance &amp; Progress; with some pitfalls too</a>								</li> \r\n								<!--  /Posts Unit  --> \r\n															<li> \r\n									<a href="http://www.majic.wildflower.ss29/p/a-new-post-in-ie">a new post in ie</a>								</li> \r\n								<!--  /Posts Unit  --> \r\n															<li> \r\n									<a href="http://www.majic.wildflower.ss29/p/totally-awesome">Totally awesome</a>								</li> \r\n								<!--  /Posts Unit  --> \r\n														</ul> \r\n							<!-- /DYNAMIC General Units  --> \r\n						</li> \r\n					</ul> \r\n					<!--  /DYNAMIC GENERAL Units  --> \r\n			</li> \r\n			<li><a href="/contact">Contact</a> \r\n				<ul> \r\n					<li><a href="/contact/offices">Offices</a> \r\n						<ul> \r\n							<li><a href="contact/map">Map</a></li> \r\n							<li><a href="contact/form">Contact Form</a></li> \r\n						</ul> \r\n					</li> \r\n				</ul> \r\n			</li> \r\n			<li><a href="/contact">Contact</a> \r\n				<ul> \r\n					<li><a href="/contact/offices">Offices</a> \r\n						<ul> \r\n							<li><a href="contact/map">Map</a></li> \r\n							<li><a href="contact/form">Contact Form the new</a></li> \r\n						</ul> \r\n					</li> \r\n				</ul> \r\n			</li> \r\n		</ul> ', '2010-02-18 06:59:50', '2010-02-18 06:59:50'),
(2, 'galleries', 'galleries', '<ul id="primaryNav" class="col4"> \r\n				<li id="home"><a href="/">Galleries Sitemap Sitemap</a></li> \r\n \r\n				<li>							<!-- STATICS not home --> \r\n							<ul> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/home">Wildflower is a CakePHP content management system</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/api">API</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/api/controllers">Controllers</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/api/models">models</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/api/helpers-2">helpers</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/documentation">Documentation</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/documentation/my-new-page-with-non-apphelper-slug-method-but-against-the-dry-convention">my new page with non-apphelper slug method - but against the DRY convention</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/features">features</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/features/sub-features">Sub Features</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/features/sub-features/some-wired-shite-some-new-stuff-added">Some wired shite &amp; Some new stuff added</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/features/plugins">Plugins</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/features/plugins/add-ons-for-plugins">Add-ons for Plugins</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/features/plugins/add-ons-for-plugins/very-deep-shite-here">very deep shite here</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/features/plugins/yet-another-plugin">Yet Another Plugin</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/features/plugins/mce-advanced-image-resizing">MCE Advanced Image Resizing</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/features/plugins/no-sleep-for-the-ambitious">NO! sleep for the ambitious</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/features/plugins/mce-advanced-image-resizing-part-4">MCE Advanced Image Resizing part 4</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/features/modules-sidebars-menus-oh-my">Modules - sidebars &amp; menus oh my</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/features/short-urls">short urls</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/features/flash-helper">Flash Helper</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/contact">Contact</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/wildflower-a-cms-in-kit-form">Wildflower - A Cms in Kit Form</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/creating-a-page-in-ie">Creating a page in IE</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/another-new-page-this-time-dry-but-will-it-work">Another new page this time DRY but will it work?</a>								</li> \r\n															<li> \r\n								<a href="http://www.majic.wildflower.ss29/third-test-with-some-cruft-remvoed-unless-behaviors-have-no-acccess-to-appcontroller">third test with some cruft remvoed unless behaviors have no acccess to AppController</a>								</li> \r\n															<li> \r\n								<a href="/sitemap/dashboards/search">Search</a>								</li> \r\n														</ul> \r\n							<!-- /STATICS --> \r\n								\r\n				</li><li> \r\n						<!-- DYNAMIC General Units  --> \r\n					<ul>						<li> \r\n							<h4> \r\n							<a href="http://www.majic.wildflower.ss29/posts">Posts</a>							</h4> \r\n							<!--  Posts Unit  --> \r\n							<ul> \r\n															<li> \r\n									<a href="http://www.majic.wildflower.ss29/p/lizards">Lizards</a>								</li> \r\n								<!--  /Posts Unit  --> \r\n															<li> \r\n									<a href="http://www.majic.wildflower.ss29/p/cats">Cats</a>								</li> \r\n								<!--  /Posts Unit  --> \r\n															<li> \r\n									<a href="http://www.majic.wildflower.ss29/p/dogs">Dogs</a>								</li> \r\n								<!--  /Posts Unit  --> \r\n															<li> \r\n									<a href="http://www.majic.wildflower.ss29/p/bears">Bears</a>								</li> \r\n								<!--  /Posts Unit  --> \r\n															<li> \r\n									<a href="http://www.majic.wildflower.ss29/p/sharks-1">Sharks</a>								</li> \r\n								<!--  /Posts Unit  --> \r\n															<li> \r\n									<a href="http://www.majic.wildflower.ss29/p/eagle">Eagle</a>								</li> \r\n								<!--  /Posts Unit  --> \r\n															<li> \r\n									<a href="http://www.majic.wildflower.ss29/p/crocodiles">Crocodiles</a>								</li> \r\n								<!--  /Posts Unit  --> \r\n															<li> \r\n									<a href="http://www.majic.wildflower.ss29/p/the-taking-of-pelham-123">The Taking of Pelham 123</a>								</li> \r\n								<!--  /Posts Unit  --> \r\n															<li> \r\n									<a href="http://www.majic.wildflower.ss29/p/a-golden-post-here">a golden post here</a>								</li> \r\n								<!--  /Posts Unit  --> \r\n															<li> \r\n									<a href="http://www.majic.wildflower.ss29/p/a-silver-post">A Silver Post</a>								</li> \r\n								<!--  /Posts Unit  --> \r\n															<li> \r\n									<a href="http://www.majic.wildflower.ss29/p/wiki-on-git">Wiki on Git</a>								</li> \r\n								<!--  /Posts Unit  --> \r\n															<li> \r\n									<a href="http://www.majic.wildflower.ss29/p/testing-altered-readable-wysiwyg-content">Testing altered readable WYSIWYG content</a>								</li> \r\n								<!--  /Posts Unit  --> \r\n															<li> \r\n									<a href="http://www.majic.wildflower.ss29/p/progress">Signs of Brilliance &amp; Progress; with some pitfalls too</a>								</li> \r\n								<!--  /Posts Unit  --> \r\n															<li> \r\n									<a href="http://www.majic.wildflower.ss29/p/a-new-post-in-ie">a new post in ie</a>								</li> \r\n								<!--  /Posts Unit  --> \r\n															<li> \r\n									<a href="http://www.majic.wildflower.ss29/p/totally-awesome">Totally awesome</a>								</li> \r\n								<!--  /Posts Unit  --> \r\n														</ul> \r\n							<!-- /DYNAMIC General Units  --> \r\n						</li> \r\n					</ul> \r\n					<!--  /DYNAMIC GENERAL Units  --> \r\n			</li> \r\n			<li><a href="/contact">Contact</a> \r\n				<ul> \r\n					<li><a href="/contact/offices">Offices</a> \r\n						<ul> \r\n							<li><a href="contact/map">Map</a></li> \r\n							<li><a href="contact/form">Contact Form</a></li> \r\n						</ul> \r\n					</li> \r\n				</ul> \r\n			</li> \r\n			<li><a href="/contact">Contact</a> \r\n				<ul> \r\n					<li><a href="/contact/offices">Offices</a> \r\n						<ul> \r\n							<li><a href="contact/map">Map</a></li> \r\n							<li><a href="contact/form">Contact Form the new</a></li> \r\n						</ul> \r\n					</li> \r\n				</ul> \r\n			</li> \r\n		</ul> ', '2010-02-18 06:59:50', '2010-02-18 06:59:50');

-- --------------------------------------------------------

--
-- Table structure for table `tags`
--

CREATE TABLE IF NOT EXISTS `tags` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(100) DEFAULT NULL,
  `count` int(10) NOT NULL DEFAULT '0',
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Dumping data for table `tags`
--


-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `login` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `password` char(40) COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `cookie_token` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `created` datetime NOT NULL,
  `updated` datetime NOT NULL,
  `last_login` datetime DEFAULT NULL,
  `group_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cookie` (`cookie_token`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=111 ;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `login`, `password`, `email`, `name`, `cookie_token`, `created`, `updated`, `last_login`, `group_id`) VALUES
(1, 'admin', 'e569c558b6119c2948d97ff3bffd87423f75c2b1', 'admin@localhost.sk', 'Mr Admin', 'b86da1d23af76ed068fc49f1291c3a0a93cece69', '2008-07-11 14:24:43', '2010-02-04 13:52:32', '0000-00-00 00:00:00', 1);

-- --------------------------------------------------------

--
-- Table structure for table `widgets`
--

CREATE TABLE IF NOT EXISTS `widgets` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `config` text COLLATE utf8_unicode_ci,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=26 ;

--
-- Dumping data for table `widgets`
--

