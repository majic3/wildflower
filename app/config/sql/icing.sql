
--
-- Table structure for table `wild_pages`
--

DROP TABLE IF EXISTS `wild_pages`;
CREATE TABLE IF NOT EXISTS `wild_pages` (
  `id` int(11) NOT NULL auto_increment,
  `parent_id` int(11) default NULL,
  `lft` int(11) default NULL,
  `rght` int(11) default NULL,
  `level` int(3) NOT NULL default '0' COMMENT 'Page level in the tree hierarchy',
  `slug` varchar(255) collate utf8_unicode_ci NOT NULL COMMENT 'URL friendly page name',
  `url` varchar(255) collate utf8_unicode_ci NOT NULL COMMENT 'Full URL relative to root of the application',
  `title` varchar(255) collate utf8_unicode_ci NOT NULL,
  `content` text collate utf8_unicode_ci,
  `description_meta_tag` text collate utf8_unicode_ci,
  `keywords_meta_tag` text collate utf8_unicode_ci,
  `draft` tinyint(1) NOT NULL default '0',
  `created` datetime NOT NULL,
  `updated` datetime NOT NULL,
  `sidebar_content` text collate utf8_unicode_ci,
  `wild_user_id` int(11) default NULL,
  PRIMARY KEY  (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `parent_id` (`parent_id`),
  KEY `lft` (`lft`),
  KEY `rght` (`rght`),
  KEY `draft` (`draft`),
  FULLTEXT KEY `content` (`content`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=202 ;

--
-- Dumping data for table `wild_pages`
--

INSERT INTO `wild_pages` (`id`, `parent_id`, `lft`, `rght`, `level`, `slug`, `url`, `title`, `content`, `description_meta_tag`, `keywords_meta_tag`, `draft`, `created`, `updated`, `sidebar_content`, `wild_user_id`) VALUES
(190, NULL, 5, 6, 0, 'feature-tour', '/feature-tour', 'Feature tour', '<p>TinyMCE</p>\n<ul>\n<li>image insert from assets, also from gallery todo, also screen shots minor tweak required</li>\n<li>link insert - todo</li>\n<li>spelling plugin - not quite</li>\n</ul>\n<p>Open ID &amp; Gravatar<br />Using Andy Dawson''s componant - barley off the ground</p>\n<p>Dashboard<br />Listing of posts comments too and quick posting.&nbsp; Listing of pages draft and recent. Messages listed working want to improve some CSS - theres a blue color to remove minor stuff.</p>\n<p>Themes Settings<br />Choose the theme via a wf stored setting.</p>\n<p>Google Tracking &amp; Stats<br />ga tracker &amp; statistics displayed using AM Charts in flash.</p>\n<p>Links &amp; Feeds<br />A bit to do here will allow you to manage feeds and stuff</p>\n<p>Gallery</p>\n<ul>\n<li>Flickr - basic images from flickr I don''t really use it but thought it good to include</li>\n<li>Picasa - jsut thought of this :)</li>\n<li>Director - using the full API of director enables you to use wf slugs with director content</li>\n<li>Wildflower - just images requires an extra table.&nbsp; Standard features but basic ready soon.</li>\n</ul>\n<p>Static Blocks<br />insert static blocks into pages or your custom sections (MVC).&nbsp; These may also be used in views.&nbsp; Just add the wildflower.element to helpers of controller or app_controller</p>\n<p>jQuery Plugins</p>\n<ul>\n<li>growl</li>\n<li>gfeed</li>\n<li>tipsy</li>\n<li>jquery ui (dates, tabs)</li>\n<li>jscroll</li>\n<li>password strengt</li>\n<li>gatracker</li>\n<li>jscroll</li>\n<li>gallery plugins</li>\n<li>smooth scroller</li>\n<li>deadlink checker</li>\n</ul>\n<p>Boilerplate CSS - nicer than blueprint</p>\n<p>Multitasks - run daemon tasks requires multi threading.&nbsp; Not yet in works (very early not for production)</p>\n<p>DebugKit - works be may cause node not exists error. looking into resolving this but hey.</p>\n<p>Media Plugin - not yet used but 2300 ways of handling media is nice.&nbsp; Wf already does handle media well, though we can''t store in subdirs fuey!</p>\n<p>Minify Filter - I have this working in basic cake app as test with an older version of minify will be updating this soon</p>', NULL, NULL, 0, '2009-01-19 05:03:37', '2009-03-06 02:34:03', '<ul>\n<li><a href="/templates-view">Templates</a> - View</li>\n<li> \n<ul>\n<li><a href="/templates/gallery">Gallery</a> - John Oxton Fullplate View</li>\n<li><a href="/templates/gallery-jquery-1">Gallery</a> - jQuery #1 View</li>\n<li><a href="/templates/gallery-jquery-2">Gallery</a> - jQuery #2 View</li>\n<li><a href="/templates/jquery-ui">jQuery ui</a></li>\n</ul>\n</li>\n</ul>', 1),
(194, NULL, 7, 8, 0, 'about', '/about', 'About', '<p>The Majic3 branch of Klevo''s Wildflower CMS plugin for CakePHP.&nbsp; Take the <a href="/feature-tour">feature tour</a> to see whats been changed in this branch of this awesome plugin for your favorite php framework.</p>', NULL, NULL, 0, '2009-02-26 16:27:15', '2009-03-06 02:05:19', '', 1),
(195, NULL, 9, 18, 0, 'templates', '/templates', 'templates', '<p>The are template test &amp; ui tests</p>\n<ul>\n<li>gallery\n<ul>\n<li>John Oxton Style Gallery Fullplate </li>\n<li>jquery gallery#1</li>\n<li>jquery gallery#2</li>\n</ul>\n</li>\n<li>jquery ui</li>\n<li>notices &amp; other styles</li>\n</ul>', NULL, NULL, 0, '2009-02-27 02:02:26', '2009-02-27 03:02:14', NULL, 1),
(189, NULL, 3, 4, 0, 'documentation', '/documentation', 'Documentation', '<p>Contributors:</p>\n<ul>\n<li>Klevo</li>\n<li>MrRio</li>\n<li>Sams</li>\n</ul>', NULL, NULL, 0, '2009-01-19 04:57:28', '2009-03-03 21:35:52', '', 1),
(185, NULL, 1, 2, 0, 'new-home-page', '/new-home-page', 'Home page', '<div class="summary">\n<p>You can take advantage of themes, making it easy to switch the look and feel of your page quickly and easily.</p>\n<p>To use themes, you need to tell your controller to use the ThemeView class instead of the default View class.</p>\n<a class="codeToggle" href="http://book.cakephp.org/view/488/Themes#">Plain Text View</a>\n<pre class="php">class ExampleController extends AppController {<br />    var $view = ''Theme'';<br />}<br /></pre>\n<ol class="code">\n<li><code><span class="keyword">class </span><span class="default">ExampleController </span><span class="keyword">extends </span><span class="default">AppController </span><span class="keyword">{</span></code></li>\n<li class="even"><code><span class="keyword"> var </span><span class="default">$view </span><span class="keyword">= </span><span class="string">''Theme''</span><span class="keyword">;</span></code></li>\n<li><code><span class="keyword">}</span></code></li>\n</ol>\n<p>To declare which theme to use by default, specify the theme name in your controller.</p>\n<a class="codeToggle" href="http://book.cakephp.org/view/488/Themes#">Plain Text View</a>\n<pre class="php">class ExampleController extends AppController {<br />    var $view = ''Theme'';<br />    var $theme = ''example'';<br />}<br /></pre>\n<ol class="code">\n<li><code><span class="keyword">class </span><span class="default">ExampleController </span><span class="keyword">extends </span><span class="default">AppController </span><span class="keyword">{</span></code></li>\n<li class="even"><code><span class="keyword"> var </span><span class="default">$view </span><span class="keyword">= </span><span class="string">''Theme''</span><span class="keyword">;</span></code></li>\n<li><code><span class="keyword"> var </span><span class="default">$theme </span><span class="keyword">= </span><span class="string">''example''</span><span class="keyword">;</span></code></li>\n<li class="even"><code><span class="keyword">}</span></code></li>\n</ol>\n<p>You can also set or change the theme name within an action or within the <code>beforeFilter</code> or <code>beforeRender</code> callback functions.</p>\n<a class="codeToggle" href="http://book.cakephp.org/view/488/Themes#">Plain Text View</a>\n<pre class="php">$this-&gt;theme = ''another_example'';<br /></pre>\n<ol class="code">\n<li><code><span class="default">$this</span><span class="keyword">-&gt;</span><span class="default">theme </span><span class="keyword">= </span><span class="string">''another_example''</span><span class="keyword">;</span></code></li>\n</ol>\n<p>Theme view files need to be within the /app/views/themed/ folder. Within the themed folder, create a folder using the same name as your theme name. Beyond that, the folder structure within the /app/views/themed/example/ folder is exactly the same as /app/views/.</p>\n<p>For example, the view file for an edit action of a Posts controller would reside at /app/views/themed/example/posts/edit.ctp. Layout files would reside in /app/views/themed/example/layouts/.</p>\n<p>If a view file can''t be found in the theme, CakePHP will try to locate the view file in the /app/views/ folder. This way, you can create master view files and simply override them on a case-by-case basis within your theme folder.</p>\n<p>If you have CSS or JavaScript files that are specific to your theme, you can store them in a themed folder within webroot. For example, your stylesheets would be stored in /app/webroot/themed/example/css/ and your JavaScript files would be stored in /app/webroot/themed/example/js/.</p>\n<p>All of CakePHP''s built-in helpers are aware of themes and will create the correct paths automatically. Like view files, if a file isn''t in the theme folder, it''ll default to the main webroot folder.</p>\n</div>', 'home page of escher icing', 'escher, teselation', 0, '2009-01-14 16:25:39', '2009-02-27 07:18:26', 'some side bar stuff here', 1),
(200, NULL, 19, 20, 0, 'a-draft', '/a-draft', 'A Draft', '', NULL, NULL, 1, '2009-02-27 23:58:39', '2009-02-27 23:59:01', NULL, 1),
(201, NULL, 21, 22, 0, 'a-new-draft-a-new-hope', '/a-new-draft-a-new-hope', 'A New Draft - (A New Hope)', '<p>Joy Joy</p>', NULL, NULL, 1, '2009-02-28 01:06:24', '2009-02-28 01:06:53', NULL, 1),
(196, 195, 10, 11, 0, 'gallery-john-oxton-fullplate', '/templates/gallery-john-oxton-fullplate', 'Gallery - John Oxton Fullplate', '<p>a gallery should be here as example</p>', NULL, NULL, 0, '2009-02-27 03:06:38', '2009-02-27 03:07:08', NULL, 1),
(197, 195, 12, 13, 0, 'gallery-jquery-1', '/templates/gallery-jquery-1', 'Gallery Jquery #1', '<p>gallery here</p>', NULL, NULL, 0, '2009-02-27 03:08:46', '2009-02-27 03:09:09', NULL, 1),
(198, 195, 14, 15, 0, 'gallery-jquery-2', '/templates/gallery-jquery-2', 'gallery jquery #2', '<p>gallery</p>', NULL, NULL, 0, '2009-02-27 03:10:00', '2009-02-27 03:11:38', NULL, 1),
(199, 195, 16, 17, 0, 'jquery-ui', '/templates/jquery-ui', 'jquery ui', '<p>jQuery UI Test Page here</p>', NULL, NULL, 0, '2009-02-27 03:12:18', '2009-02-27 03:12:48', NULL, 1);


CREATE TABLE IF NOT EXISTS `wild_links` (
  `id` int(11) NOT NULL auto_increment,
  `slug` char(125) collate utf8_unicode_ci NOT NULL,
  `name` varchar(100) collate utf8_unicode_ci NOT NULL,
  `url` varchar(255) collate utf8_unicode_ci NOT NULL,
  `image` char(255) collate utf8_unicode_ci default NULL,
  `created` datetime NOT NULL,
  `updated` datetime NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Stores links & used for RSS feeds for gfeed later';


ALTER TABLE `wild_posts` ADD `cmtsClosed` INT( 1 ) NOT NULL DEFAULT '0' AFTER `uuid`;



CREATE TABLE IF NOT EXISTS `wild_categories_wild_links` (
  `category_id` int(11) NOT NULL,
  `link_id` int(11) NOT NULL,
  KEY `category_id` (`category_id`,`link_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


CREATE TABLE IF NOT EXISTS `wild_profiles` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `user_id` int(10) NOT NULL default '0',
  `avatar` varchar(45) default NULL,
  `data` text NOT NULL,
  `url` varchar(255) default NULL,
  `created` datetime NOT NULL,
  `updated` datetime NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 ;



CREATE TABLE IF NOT EXISTS `wild_stats` (
  `id` int(11) NOT NULL auto_increment,
  `title` varchar(125) NOT NULL,
  `datafile` varchar(80) NOT NULL,
  `created` datetime NOT NULL,
  `updated` datetime NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1;



DROP TABLE IF EXISTS `wild_settings`;
CREATE TABLE IF NOT EXISTS `wild_settings` (
  `id` int(11) NOT NULL auto_increment,
  `name` varchar(255) collate utf8_unicode_ci NOT NULL,
  `value` text collate utf8_unicode_ci NOT NULL,
  `description` varchar(255) collate utf8_unicode_ci default NULL,
  `type` varchar(255) collate utf8_unicode_ci default NULL,
  `label` varchar(255) collate utf8_unicode_ci default NULL,
  `order` int(11) NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=14 ;

--
-- Dumping data for table `wild_settings`
--

INSERT INTO `wild_settings` (`id`, `name`, `value`, `description`, `type`, `label`, `order`) VALUES
(1, 'site_name', 'Wildflower 1.3b1', '', 'text', NULL, 1),
(2, 'description', 'A CakePHP CMS', '', 'textbox', NULL, 2),
(3, 'home_page_id', '185', 'Page that will be shown when visiting the site root.', 'select', 'Home page', 3),
(4, 'contact_email', 'klevo@klevo.sk', 'You`ll receive notifications when somebody posts a comment or uses the contact form on this email address.', 'text', 'Contact email address', 4),
(5, 'google_analytics_code', '', '', 'textbox', NULL, 10),
(6, 'wordpress_api_key', '', '', 'text', NULL, 9),
(7, 'smtp_server', '', '', 'text', NULL, 6),
(8, 'smtp_username', '', '', 'text', NULL, 7),
(9, 'smtp_password', '', '', 'text', NULL, 8),
(11, 'email_delivery', 'debug', NULL, 'select', NULL, 5),
(12, 'cache', 'off', NULL, 'select', 'Page and post caching', 11),
(13, 'public_theme', 'icing', 'Dirtectory name that stores Views or Assets used to make this theme in respective thmed directories', 'text', 'Public Theme', 14);
