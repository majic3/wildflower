-- phpMyAdmin SQL Dump
-- version 3.1.4
-- http://www.phpmyadmin.net
--
-- Host: localhost:3306
-- Generation Time: Aug 25, 2009 at 03:49 AM
-- Server version: 5.1.34
-- PHP Version: 5.2.9-2

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `wildflower_majic`
--

-- --------------------------------------------------------

--
-- Table structure for table `assets`
--

DROP TABLE IF EXISTS `assets`;
CREATE TABLE IF NOT EXISTS `assets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `mime` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `created` datetime NOT NULL,
  `updated` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `mime` (`mime`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=16 ;

--
-- Dumping data for table `assets`
--

INSERT INTO `assets` (`id`, `name`, `title`, `mime`, `created`, `updated`) VALUES
(15, 'full-logo.gif', 'full-logo', 'image/gif', '2009-08-10 12:35:38', '2009-08-10 12:35:38');

-- --------------------------------------------------------

--
-- Table structure for table `blocks`
--

DROP TABLE IF EXISTS `blocks`;
CREATE TABLE IF NOT EXISTS `blocks` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(125) COLLATE utf8_unicode_ci NOT NULL COMMENT 'internal description of block',
  `headc` text COLLATE utf8_unicode_ci COMMENT 'content for the head of the document (might be css,js,keywords)',
  `content` text COLLATE utf8_unicode_ci,
  `created` datetime DEFAULT NULL,
  `updated` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=2 ;

--
-- Dumping data for table `blocks`
--

INSERT INTO `blocks` (`id`, `name`, `headc`, `content`, `created`, `updated`) VALUES
(1, '', NULL, '<p>Lorem ipsum.</p>', '2009-05-17 07:03:29', '2009-08-07 01:16:25');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
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
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=61 ;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `parent_id`, `lft`, `rght`, `slug`, `title`, `description`) VALUES
(58, 57, 8, 9, 'sci-fi', 'Sci-fi', NULL),
(59, 57, 10, 11, 'love-poetry', 'Love poetry', NULL),
(54, 53, 2, 3, 'action', 'Action', NULL),
(56, NULL, 5, 6, 'cooking', 'Cooking', NULL),
(57, NULL, 7, 12, 'books', 'Books', NULL),
(53, NULL, 1, 4, 'movies', 'Movies', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `categories_posts`
--

DROP TABLE IF EXISTS `categories_posts`;
CREATE TABLE IF NOT EXISTS `categories_posts` (
  `category_id` int(11) DEFAULT NULL,
  `post_id` int(11) DEFAULT NULL,
  KEY `category_id` (`category_id`,`post_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `categories_posts`
--

INSERT INTO `categories_posts` (`category_id`, `post_id`) VALUES
(56, 69),
(57, 56),
(57, 70),
(59, 49),
(59, 52),
(59, 71);

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
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
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=24 ;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`id`, `post_id`, `name`, `email`, `url`, `content`, `spam`, `created`, `updated`, `approved`) VALUES
(17, 64, 'sam', 'info@majic3.com', 'http://www.majic3.com', 'a cuddly bear is nice; but not all bears are friendly - beware', 0, '2009-08-06 17:59:08', '2009-08-06 17:59:08', 1),
(19, 66, 'sammo hung', 'sammo.me@yahoo.co.uk', 'http://majic3.com', 'testing', 0, '2009-08-07 15:00:16', '2009-08-07 15:00:16', 1),
(20, 68, 'testing', 'test@test.com', 'http://majic3.com', 'hmmmm', 0, '2009-08-07 15:03:28', '2009-08-07 15:03:28', 1),
(21, 68, 'testing', 'test@test.com', 'http://majic3.com', 'hmmmm', 0, '2009-08-07 15:14:27', '2009-08-07 15:14:27', 1),
(22, 66, 'me', 'info@majic3.com', 'http://majic3.com', 'test ajax', 0, '2009-08-07 17:12:02', '2009-08-07 17:12:02', 0),
(23, 71, 'sam', 'info@majic3.com', 'http://majic3.com', 'testing posts', 0, '2009-08-23 06:43:11', '2009-08-23 06:43:11', 1);

-- --------------------------------------------------------

--
-- Table structure for table `menus`
--

DROP TABLE IF EXISTS `menus`;
CREATE TABLE IF NOT EXISTS `menus` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `slug` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=3 ;

--
-- Dumping data for table `menus`
--

INSERT INTO `menus` (`id`, `title`, `slug`) VALUES
(1, 'Main menu', 'Main_menu'),
(2, 'API Menu', 'api-menu');

-- --------------------------------------------------------

--
-- Table structure for table `menu_items`
--

DROP TABLE IF EXISTS `menu_items`;
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
(2, 1, 'Posts', '/posts', 2),
(3, 1, 'Documentation', '/documentation', 3),
(4, 1, 'API', '/api', 4),
(5, 1, 'Source Code', 'http://github.com/klevo/wildflower/tree/master', 5),
(6, 1, 'Contact', '/contact', 7),
(7, 1, 'Feautres', '/features', 1),
(8, 1, 'Donate', '/donate', 6);

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
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
-- Table structure for table `pages`
--

DROP TABLE IF EXISTS `pages`;
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
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=225 ;

--
-- Dumping data for table `pages`
--

INSERT INTO `pages` (`id`, `parent_id`, `lft`, `rght`, `level`, `slug`, `url`, `title`, `content`, `description_meta_tag`, `keywords_meta_tag`, `draft`, `created`, `updated`, `sidebar_content`, `user_id`, `custom_fields`) VALUES
(211, NULL, 3, 4, 0, 'api', '/api', 'API', '<h2>WildHelper</h2>\n<h3>menu($slug, $id = null)</h3>\n<p>bla bla</p>\n<p>&nbsp;</p>\n<p>this has various sidebars</p>', NULL, NULL, 0, '2009-06-28 19:14:16', '2009-08-23 07:09:24', NULL, 1, NULL),
(212, NULL, 5, 6, 0, 'documentation', '/documentation', 'Documentation', '', NULL, NULL, 0, '2009-06-29 19:07:22', '2009-06-29 19:07:22', NULL, NULL, NULL),
(210, NULL, 1, 2, 0, 'home', '/home', 'Wildflower is a CakePHP content management system', '<p>The aim is to remove all unnecessary features of a modern CMS and provide the most effective and simple way to manage a website.</p>\n<p>The foundation of a rapid development framework CakePHP allows developers to build any features specific to their project quickly and effectively.</p>', NULL, NULL, 0, '2009-06-28 18:15:30', '2009-06-28 18:52:54', NULL, 1, NULL),
(213, NULL, 7, 18, 0, 'features', '/features', 'features', '<div id="wfEBlock1" class="block mceNonEditable">\n<p>OMG Features here</p>\n<p>More possibilieis too the only limits are your own stamina &amp; ambitions</p>\n<ul>\n<li>Short urls inspired by Snook &amp; Shiflet</li>\n<li>Tweaks to config</li>\n<li>SEO Tweaks</li>\n<li>Deluxe Sitemaps</li>\n<li>Template &amp; Layout control</li>\n<li>Wildflower Shell (not done yet)</li>\n<li>filament group ui tweaks &amp; more jquery ui</li>\n<li>post mods<br /> \n<ul>\n<li>comments ajax</li>\n<li>avatars</li>\n<li>date formatting (more snook)</li>\n</ul>\n</li>\n<li>CSS<br /> \n<ul>\n<li>Object Orientated CSS by Nicole Sullivian</li>\n<li>Vladimir Carrers Print &amp; Form CSS Frameworks Harjes &amp; Formy + use of improved readablity for the web</li>\n</ul>\n</li>\n<li>Bram.us''s plugin for tiny mce to allow control of id &amp; class attributes from editor (using Vladimir improved readablity to format editor content [yes this is freaking experimental and may have issues])</li>\n</ul>\n</div>\n<p>&nbsp;</p>\n<p>Testing an idea that will allow live items to be inserted into page content much like widgets but blocks are edited just like pages with interface controls to manage the updating of content</p>\n<p>&nbsp;</p>\n<p>more coming</p>', NULL, NULL, 0, '2009-08-06 18:05:31', '2009-08-11 03:33:56', NULL, 1, NULL),
(214, 213, 8, 9, 0, 'sub-features', '/features/sub-features', 'Sub Features', '<div class="exerpt">\n<p>this is a sub page</p>\n</div>', NULL, NULL, 0, '2009-08-06 18:08:48', '2009-08-09 06:52:45', NULL, 1, NULL),
(215, 213, 10, 13, 0, 'plugins', '/features/plugins', 'Plugins', '<p>Its easto use cakephp plugins in wf and extremely rewarding to but can a shell task of an app call another shell task that resides in a plugin - for that matter can a plugins shell task call another plugins shell tasks?</p>\n<p>this is a sub <strong>page</strong></p>\n<p>use jquery plguins easily t</p>', NULL, NULL, 0, '2009-08-06 18:10:12', '2009-08-22 22:09:35', NULL, 1, NULL),
(216, 213, 14, 15, 0, 'modules-sidebars-menus-oh-my', '/features/modules-sidebars-menus-oh-my', 'Modules - sidebars & menus oh my', '<h2>Sidebars</h2>\n<p>a very succient feature that enables pages to have multiple sections of sidebar content but how you mark it is upto you.&nbsp; Posts can have sidebars too - you could make your own unit (controller, model &amp; views) and have sidebars added to this too</p>\n<h2>Menus</h2>\n<p>Ability to control site menus and create new ones too. Sub page menus? (this is a subpage)</p>', NULL, NULL, 0, '2009-08-06 18:13:52', '2009-08-06 18:20:43', NULL, 1, NULL),
(223, 213, 16, 17, 0, 'short-urls', '/features/short-urls', 'short urls', '<p>foreinstance this page has a short url of</p>\n<p>&nbsp;</p>\n<p>and a <a href="http://majic.wildflower.ss29/s/so">golden post</a> too; noting tjat .htaccess can be set to use a distinct domain for shorts, also that rev canoical is set also</p>', '', 'short, feature', 0, '2009-08-23 08:01:00', '2009-08-23 08:09:21', NULL, 1, NULL),
(222, NULL, 27, 28, 0, 'contact', '/contact', 'Contact', '<p>Contact Page Message here</p>', NULL, NULL, 0, '2009-08-23 05:57:14', '2009-08-23 06:16:24', NULL, 1, NULL),
(224, 215, 11, 12, 0, 'add-ons-for-plugins', '/features/plugins/add-ons-for-plugins', 'Add-ons for Plugins', '<p>extra add ons for plugins to make you marvel</p>', NULL, NULL, 0, '2009-08-25 03:01:22', '2009-08-25 03:01:54', NULL, 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `pages_sidebars`
--

DROP TABLE IF EXISTS `pages_sidebars`;
CREATE TABLE IF NOT EXISTS `pages_sidebars` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `page_id` int(11) DEFAULT NULL,
  `sidebar_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=13 ;

--
-- Dumping data for table `pages_sidebars`
--

INSERT INTO `pages_sidebars` (`id`, `page_id`, `sidebar_id`) VALUES
(1, 214, 1),
(2, 222, 2),
(10, 214, 4),
(9, 213, 4),
(8, 212, 4),
(7, 211, 4),
(12, 211, 5);

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
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
  `uuid` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `comments_closed` int(1) NOT NULL DEFAULT '0',
  `comments_allowed` int(1) NOT NULL DEFAULT '0',
  `comment_count` int(11) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  FULLTEXT KEY `content` (`content`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=72 ;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`id`, `slug`, `title`, `content`, `user_id`, `description_meta_tag`, `keywords_meta_tag`, `created`, `updated`, `draft`, `uuid`, `comments_closed`, `comments_allowed`, `comment_count`) VALUES
(60, 'a-test-posts', 'A test posts', '', 1, NULL, NULL, '2009-06-29 18:44:28', '2009-07-02 18:55:22', 0, '755abcb0855fe16cc54f270e59a4efd6091783a9', 0, 0, 0),
(61, 'lizards', 'Lizards', '<div class="exerpt">\n<p><strong>Lizards</strong> are a very large and widespread group of <a class="mw-redirect" title="Squamate" href="http://en.wikipedia.org/wiki/Squamate">squamate</a> <a class="mw-redirect" title="Reptiles" href="http://en.wikipedia.org/wiki/Reptiles">reptiles</a>, with nearly 5,000 <a title="Species" href="http://en.wikipedia.org/wiki/Species">species</a>, ranging across all continents except <a title="Antarctica" href="http://en.wikipedia.org/wiki/Antarctica">Antarctica</a> as well as most oceanic island chains. The group, traditionally recognized as the suborder <strong>Lacertilia</strong>, is defined as all extant members of the <a title="Lepidosauria" href="http://en.wikipedia.org/wiki/Lepidosauria">Lepidosauria</a> (reptiles with overlapping scales) which are neither <a title="Sphenodontia" href="http://en.wikipedia.org/wiki/Sphenodontia">sphenodonts</a> (i.e., <em><a title="Tuatara" href="http://en.wikipedia.org/wiki/Tuatara">Tuatara</a></em>) nor <a class="mw-redirect" title="Snakes" href="http://en.wikipedia.org/wiki/Snakes">snakes</a>. While the snakes are recognized as falling <a title="Cladistics" href="http://en.wikipedia.org/wiki/Cladistics">phylogenetically</a> within the <a title="Anguimorpha" href="http://en.wikipedia.org/wiki/Anguimorpha">anguimorph</a> lizards from which they evolved, the sphenodonts are the <a class="mw-redirect" title="Sister group" href="http://en.wikipedia.org/wiki/Sister_group">sister group</a> to the squamates, the larger <a class="mw-redirect" title="Monophyletic" href="http://en.wikipedia.org/wiki/Monophyletic">monophyletic</a> group which includes both the lizards and the snakes.</p>\n</div>\n<p>Lizards typically have limbs and external ears, while snakes lack both these characteristics. However, because they are defined negatively as excluding snakes, lizards have no unique distinguishing characteristic as a group. Lizards and snakes share a movable <a title="Quadrate bone" href="http://en.wikipedia.org/wiki/Quadrate_bone">quadrate bone</a>, distinguishing them from the <a title="Sphenodontia" href="http://en.wikipedia.org/wiki/Sphenodontia">sphenodonts</a> which have a more primitive and solid <a title="Diapsid" href="http://en.wikipedia.org/wiki/Diapsid">diapsid</a> <a title="Skull" href="http://en.wikipedia.org/wiki/Skull">skull</a>. Many lizards can detach their tails in order to escape from predators, an act called <a title="Autotomy" href="http://en.wikipedia.org/wiki/Autotomy">autotomy</a>, but this trait is not universal. Vision, including color vision, is particularly well developed in most lizards, and most communicate with body language or bright colors on their bodies as well as with <a class="mw-redirect" title="Pheromones" href="http://en.wikipedia.org/wiki/Pheromones">pheromones</a>. The adult length of species within the <a class="mw-redirect" title="Suborder (biology)" href="http://en.wikipedia.org/wiki/Suborder_%28biology%29">suborder</a> ranges from a few <a class="mw-redirect" title="Centimeters" href="http://en.wikipedia.org/wiki/Centimeters">centimeters</a> for some <a title="Chameleon" href="http://en.wikipedia.org/wiki/Chameleon">chameleons</a> and <a title="Gecko" href="http://en.wikipedia.org/wiki/Gecko">geckos</a> to nearly three meters (9 feet, 6 inches) in the case of the largest living varanid lizard, the <a class="mw-redirect" title="Komodo Dragon" href="http://en.wikipedia.org/wiki/Komodo_Dragon">Komodo Dragon</a>. Some extinct <a class="mw-redirect" title="Varanids" href="http://en.wikipedia.org/wiki/Varanids">varanids</a> reached great size. The extinct aquatic <a class="mw-redirect" title="Mosasaurs" href="http://en.wikipedia.org/wiki/Mosasaurs">mosasaurs</a> reached 17.5 meters, and the giant monitor <em><a class="mw-redirect" title="Megalania prisca" href="http://en.wikipedia.org/wiki/Megalania_prisca">Megalania prisca</a></em> is estimated to have reached perhaps seven meters.</p>', 1, NULL, NULL, '2009-08-06 17:41:47', '2009-08-09 07:05:43', 0, '3da87c902022cffde788b147a95d13078fd8e510', 0, 0, 0),
(62, 'cats', 'Cats', '<div class="exerpt">\n<p>The <strong>cat</strong> (<em>Felis catus</em>), also known as the <strong><a title="Domestication" href="http://en.wikipedia.org/wiki/Domestication">domestic</a> cat</strong> or <strong>house cat</strong> to distinguish it from other <a title="Felinae" href="http://en.wikipedia.org/wiki/Felinae">felines</a> and <a title="Felidae" href="http://en.wikipedia.org/wiki/Felidae">felids</a>, is a small <a title="Predation" href="http://en.wikipedia.org/wiki/Predation">predatory</a> <a title="Carnivore" href="http://en.wikipedia.org/wiki/Carnivore">carnivorous</a> <a title="Species" href="http://en.wikipedia.org/wiki/Species">species</a> of <a title="Crepuscular" href="http://en.wikipedia.org/wiki/Crepuscular">crepuscular</a> <a title="Mammal" href="http://en.wikipedia.org/wiki/Mammal">mammal</a> that is valued by <a title="Human" href="http://en.wikipedia.org/wiki/Human">humans</a> for its companionship and its ability to hunt <a title="Vermin" href="http://en.wikipedia.org/wiki/Vermin">vermin</a>, <a title="Snake" href="http://en.wikipedia.org/wiki/Snake">snakes</a>, and other unwanted household pests. It has been associated with humans for at least 9,500 years.<sup id="cite_ref-9500_years_4-0" class="reference"><a href="http://en.wikipedia.org/wiki/Cats#cite_note-9500_years-4"><span>[</span>5<span>]</span></a></sup></p>\n</div>\n<p>A skilled predator, the cat is known to hunt over 1,000 <a title="Species" href="http://en.wikipedia.org/wiki/Species">species</a> for <a title="Food" href="http://en.wikipedia.org/wiki/Food">food</a>. It can be trained to obey simple commands. Individual cats have also been known to <a title="Learning" href="http://en.wikipedia.org/wiki/Learning">learn</a> on their own to manipulate simple mechanisms, such as <a title="Door handle" href="http://en.wikipedia.org/wiki/Door_handle">doorknobs</a> and <a title="Toilet" href="http://en.wikipedia.org/wiki/Toilet">toilet</a> handles.<sup id="cite_ref-5" class="reference"><a href="http://en.wikipedia.org/wiki/Cats#cite_note-5"><span>[</span>6<span>]</span></a></sup> Cats use a variety of <a title="Animal communication" href="http://en.wikipedia.org/wiki/Animal_communication">vocalizations</a> and types of <a title="Cat body language" href="http://en.wikipedia.org/wiki/Cat_body_language">body language</a> for <a title="Cat communication" href="http://en.wikipedia.org/wiki/Cat_communication">communication</a>, including <a title="Cat communication" href="http://en.wikipedia.org/wiki/Cat_communication#meowing">meowing</a>, <a title="Purr" href="http://en.wikipedia.org/wiki/Purr">purring</a>, "trilling", <a title="Hiss" href="http://en.wikipedia.org/wiki/Hiss#animals">hissing</a>, <a title="Growling" href="http://en.wikipedia.org/wiki/Growling">growling</a>, squeaking, <a title="Chirp" href="http://en.wikipedia.org/wiki/Chirp">chirping</a>, <a title="Click consonant" href="http://en.wikipedia.org/wiki/Click_consonant">clicking</a>, and grunting.<sup id="cite_ref-Channel3000Meows_6-0" class="reference"><a href="http://en.wikipedia.org/wiki/Cats#cite_note-Channel3000Meows-6"><span>[</span>7<span>]</span></a></sup> Cats may be the most popular <a title="Pet" href="http://en.wikipedia.org/wiki/Pet">pet</a> in the world, with over 600 million in homes all over the world.<sup id="cite_ref-7" class="reference"><a href="http://en.wikipedia.org/wiki/Cats#cite_note-7"><span>[</span>8<span>]</span></a></sup> They are also bred and shown as <a title="Cat registry" href="http://en.wikipedia.org/wiki/Cat_registry">registered</a> pedigree pets. This hobby is known as "<a title="Animal fancy" href="http://en.wikipedia.org/wiki/Animal_fancy">cat fancy</a>".</p>\n<p>Until recently the cat was commonly believed to have been domesticated in <a title="Ancient Egypt" href="http://en.wikipedia.org/wiki/Ancient_Egypt">ancient Egypt</a>, where it was a <a title="Cult" href="http://en.wikipedia.org/wiki/Cult">cult</a> animal.<sup id="cite_ref-NYT_8-0" class="reference"><a href="http://en.wikipedia.org/wiki/Cats#cite_note-NYT-8"><span>[</span>9<span>]</span></a></sup> However, in 2004, the earliest known location of cat domestication was discovered to be ancient <a title="Cyprus" href="http://en.wikipedia.org/wiki/Cyprus">Cyprus</a>, and a subsequent study in 2007 found that the lines of descent of all house cats probably run through as few as five <a title="Self-domestication" href="http://en.wikipedia.org/wiki/Self-domestication">self-domesticating</a> <a title="African Wildcat" href="http://en.wikipedia.org/wiki/African_Wildcat">African Wildcats</a> <em>(Felis silvestris lybica)</em> circa <a title="8th millennium BC" href="http://en.wikipedia.org/wiki/8th_millennium_BC">8000 BC</a>, in the <a title="Near East" href="http://en.wikipedia.org/wiki/Near_East">Near East</a>.<sup id="cite_ref-SciencemagNEO_3-1" class="reference"><a href="http://en.wikipedia.org/wiki/Cats#cite_note-SciencemagNEO-3"><span>[</span>4<span>]</span></a></sup></p>', 1, NULL, NULL, '2009-08-06 17:43:14', '2009-08-09 05:16:43', 0, 'f4529b5997a101e0b4d4c5555f4140e37df035cc', 0, 0, 0),
(63, 'dogs', 'Dogs', '<p><strong>Canidae</strong> (pronounced <span class="IPA" title="Pronunciation in the International Phonetic Alphabet (IPA)"><a title="Wikipedia:IPA for English" href="http://en.wikipedia.org/wiki/Wikipedia:IPA_for_English">/ˈk&aelig;nɨdiː/</a></span><sup id="cite_ref-1" class="reference"><a href="http://en.wikipedia.org/wiki/Canidae#cite_note-1"><span>[</span>2<span>]</span></a></sup>) is the <a title="Family (biology)" href="http://en.wikipedia.org/wiki/Family_%28biology%29">biological family</a> of the dogs; a member of this family is called a <strong>canid</strong> (<span class="IPA" title="Pronunciation in IPA"><a title="Wikipedia:IPA for English" href="http://en.wikipedia.org/wiki/Wikipedia:IPA_for_English">/ˈkeɪnɨd/</a></span>). They include <a class="mw-redirect" title="Wolf" href="http://en.wikipedia.org/wiki/Wolf">wolves</a>, <a title="Fox" href="http://en.wikipedia.org/wiki/Fox">foxes</a>, <a title="Coyote" href="http://en.wikipedia.org/wiki/Coyote">coyotes</a>, and <a title="Jackal" href="http://en.wikipedia.org/wiki/Jackal">jackals</a>. The Canidae family is divided into the "true dogs" of the tribe Canini and the "foxes" of the tribe Vulpini. The two species of the basal Caninae are more primitive and do not fit into either tribe.</p>\n<h2><span class="mw-headline">Classification and relationship</span></h2>\n<p>The subdivision of Canidae into "foxes" and "true dogs" may not be in accordance with the actual relations; also the <a title="Alpha taxonomy" href="http://en.wikipedia.org/wiki/Alpha_taxonomy">taxonomic</a> classification of several canines is disputed. Recent <a title="DNA" href="http://en.wikipedia.org/wiki/DNA">DNA</a> analysis shows that Canini (dogs) and Vulpini (foxes) are valid <a title="Cladistics" href="http://en.wikipedia.org/wiki/Cladistics">clades</a>. (See phylogeny below). Molecular data implies a North American origin of living Canidae and an African origin of wolf-like canines (<em>Canis</em>, <em>Cuon</em>, and <em>Lycaon</em>).<sup id="cite_ref-Lindblad-toh2005_2-0" class="reference"><a href="http://en.wikipedia.org/wiki/Canidae#cite_note-Lindblad-toh2005-2"><span>[</span>3<span>]</span></a></sup></p>\n<p>Currently, the <a title="Dog" href="http://en.wikipedia.org/wiki/Dog">domestic dog</a> is listed as a <a title="Subspecies of Canis lupus" href="http://en.wikipedia.org/wiki/Subspecies_of_Canis_lupus">subspecies of <em>Canis lupus</em></a>, <em>C. l. familiaris</em>, and the <a title="Dingo" href="http://en.wikipedia.org/wiki/Dingo">Dingo</a> (also considered a domestic dog) as <em>C. l. dingo</em>, provisionally a separate subspecies from <em>C. l. familiaris</em>; the <a title="Red Wolf" href="http://en.wikipedia.org/wiki/Red_Wolf">Red Wolf</a>, <a class="mw-redirect" title="Eastern Canadian Wolf" href="http://en.wikipedia.org/wiki/Eastern_Canadian_Wolf">Eastern Canadian Wolf</a>, and <a title="Indian Wolf" href="http://en.wikipedia.org/wiki/Indian_Wolf">Indian Wolf</a> are recognized as <a title="Subspecies" href="http://en.wikipedia.org/wiki/Subspecies">subspecies</a>.<sup id="cite_ref-msw3_0-1" class="reference"><a href="http://en.wikipedia.org/wiki/Canidae#cite_note-msw3-0"><span>[</span>1<span>]</span></a></sup> Many sources list the domestic dog as <em>Canis familiaris</em>, but others, including the <a title="Smithsonian Institution" href="http://en.wikipedia.org/wiki/Smithsonian_Institution">Smithsonian Institution</a> and the <a title="American Society of Mammalogists" href="http://en.wikipedia.org/wiki/American_Society_of_Mammalogists">American Society of Mammalogists</a>, more precisely list it as a subspecies of <em>C. l. familiaris</em>; the Red Wolf, Eastern Canadian Wolf, and Indian Wolf may or may not be separate <a title="Species" href="http://en.wikipedia.org/wiki/Species">species</a>; the <a title="Dingo" href="http://en.wikipedia.org/wiki/Dingo">Dingo</a> has been in the past variously classified as <em>Canis dingo</em>, <em>Canis familiaris dingo</em> and <em>Canis lupus familiaris dingo</em>.</p>\n<h2><span class="mw-headline">Characteristics</span></h2>\n<p>Wild canids are found on every continent except Antarctica, and inhabit a wide range of different habitats, including <a class="mw-redirect" title="Deserts" href="http://en.wikipedia.org/wiki/Deserts">deserts</a>, <a class="mw-redirect" title="Mountains" href="http://en.wikipedia.org/wiki/Mountains">mountains</a>, <a class="mw-redirect" title="Forests" href="http://en.wikipedia.org/wiki/Forests">forests</a>, and <a title="Grassland" href="http://en.wikipedia.org/wiki/Grassland">grassland</a>. They vary in size from the <a title="Fennec Fox" href="http://en.wikipedia.org/wiki/Fennec_Fox">Fennec Fox</a> at 24&nbsp;cm long, to the <a title="Gray Wolf" href="http://en.wikipedia.org/wiki/Gray_Wolf">Gray Wolf</a>, which may be up to 2 m long, and can weigh up to 80&nbsp;kg.</p>\n<p>With the exceptions of the <a title="Bush Dog" href="http://en.wikipedia.org/wiki/Bush_Dog">Bush Dog</a> and <a title="Raccoon Dog" href="http://en.wikipedia.org/wiki/Raccoon_Dog">Raccoon Dog</a>, canids have relatively long legs and lithe bodies, adapted for chasing prey. All canids are <a title="Digitigrade" href="http://en.wikipedia.org/wiki/Digitigrade">digitigrade</a>, meaning that they walk on their toes. They possess bushy tails, non-retractile claws, and a <a title="Dewclaw" href="http://en.wikipedia.org/wiki/Dewclaw">dewclaw</a> on the front feet. They possess a <a title="Baculum" href="http://en.wikipedia.org/wiki/Baculum">baculum</a>, which together with a cavernous body helps to create a copulatory tie during mating, locking the animals together for up to an hour. Young canids are born blind, with their eyes opening a few weeks after birth. <sup id="cite_ref-9" class="reference"><a href="http://en.wikipedia.org/wiki/Canidae#cite_note-9"><span>[</span>10<span>]</span></a></sup></p>\n<div class="thumb tright">\n<div class="thumbinner" style="width: 182px;"><a class="image" title="Gray wolf pack hunting an American bison in Yellowstone National Park." href="http://en.wikipedia.org/wiki/File:Canis_lupus_pack_surrounding_Bison.jpg"><img class="thumbimage" src="http://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Canis_lupus_pack_surrounding_Bison.jpg/180px-Canis_lupus_pack_surrounding_Bison.jpg" alt="" width="180" height="145" /></a>\n<div class="thumbcaption">\n<div class="magnify"><a class="internal" title="Enlarge" href="http://en.wikipedia.org/wiki/File:Canis_lupus_pack_surrounding_Bison.jpg"><img src="http://en.wikipedia.org/skins-1.5/common/images/magnify-clip.png" alt="" width="15" height="11" /></a></div>\nGray wolf pack hunting an <a class="mw-redirect" title="American bison" href="http://en.wikipedia.org/wiki/American_bison">American bison</a> in <a title="Yellowstone National Park" href="http://en.wikipedia.org/wiki/Yellowstone_National_Park">Yellowstone National Park</a>.</div>\n</div>\n</div>\n<p><a id="Social_behavior" name="Social_behavior"></a></p>\n<h3><span class="editsection">[<a title="Edit section: Social behavior" href="http://en.wikipedia.org/w/index.php?title=Canidae&amp;action=edit&amp;section=10">edit</a>]</span> <span class="mw-headline">Social behavior</span></h3>\n<p>Almost all canids are social animals and live together in groups. In most foxes and in many of the true dogs, a male and female pair work together to hunt and to raise their young. <a class="mw-redirect" title="Gray wolves" href="http://en.wikipedia.org/wiki/Gray_wolves">Gray wolves</a> and some of the other larger canids live in larger groups called <a class="mw-redirect" title="Packs" href="http://en.wikipedia.org/wiki/Packs">packs</a>. <a class="mw-redirect" title="African wild dog" href="http://en.wikipedia.org/wiki/African_wild_dog">African wild dogs</a> have the largest packs, which can number as many as 90 animals. Some species form packs or live in small family groups depending on the circumstances, including the type of available food. In most species, there are also some individuals who live on their own. Within a canid pack, there is a system of dominance so that the strongest, most experienced animals lead the pack. In most cases, the dominant male and female are the only pack members to breed.</p>\n<p>Canids communicate with each other by scent signals, by visual clues and gestures, and by vocalizations such as growls, barks, and howls. In most cases, groups have a home territory from which they drive out others. The territory is marked by leaving urine scent marks, which warn trespassing individuals.<sup id="cite_ref-10" class="reference"><a href="http://en.wikipedia.org/wiki/Canidae#cite_note-10"><span>[</span>11<span>]</span></a></sup></p>\n<p>Most canids bear young once a year, from 1 to 16 or more (in the case of the African wild dog) at a time. The young are born small and helpless and require a long period of care. They are kept in a den, most often dug into the ground, for warmth and protection. When they begin eating solid food, both parents, and often other pack members, bring food back for them from the hunt. This is most often vomited up from the adult''s stomach. Young canids may take a year to mature and learn the skills they need to survive.<sup id="cite_ref-11" class="reference"><a href="http://en.wikipedia.org/wiki/Canidae#cite_note-11"><span>[</span>12<span>]</span></a></sup></p>\n<p><a id="Dentition" name="Dentition"></a></p>\n<h3><span class="editsection">[<a title="Edit section: Dentition" href="http://en.wikipedia.org/w/index.php?title=Canidae&amp;action=edit&amp;section=11">edit</a>]</span> <span class="mw-headline">Dentition</span></h3>\n<div class="thumb tleft">\n<div class="thumbinner" style="width: 182px;"><a class="image" title="Italian wolf skull" href="http://en.wikipedia.org/wiki/File:Lupocranio.jpg"><img class="thumbimage" src="http://upload.wikimedia.org/wikipedia/en/thumb/0/0f/Lupocranio.jpg/180px-Lupocranio.jpg" alt="" width="180" height="135" /></a>\n<div class="thumbcaption">\n<div class="magnify"><a class="internal" title="Enlarge" href="http://en.wikipedia.org/wiki/File:Lupocranio.jpg"><img src="http://en.wikipedia.org/skins-1.5/common/images/magnify-clip.png" alt="" width="15" height="11" /></a></div>\n<a class="mw-redirect" title="Italian wolf" href="http://en.wikipedia.org/wiki/Italian_wolf">Italian wolf</a> skull</div>\n</div>\n</div>\n<p>Most canids have 42 <a title="Tooth" href="http://en.wikipedia.org/wiki/Tooth">teeth</a>, with a <a title="Dentition" href="http://en.wikipedia.org/wiki/Dentition">dental formula</a> of:</p>\n<table style="margin: 0pt 0pt 0.5em 1em; border-collapse: collapse; text-align: center;" border="1" cellpadding="0">\n<tbody>\n<tr>\n<th style="background: pink none repeat scroll 0% 0%;"><strong><a title="Dentition" href="http://en.wikipedia.org/wiki/Dentition">Dentition</a></strong></th>\n</tr>\n<tr>\n<td><strong>3.1.4.2</strong></td>\n</tr>\n<tr>\n<td><strong>3.1.4.3</strong></td>\n</tr>\n</tbody>\n</table>\n<p>As in other members of <a title="Carnivora" href="http://en.wikipedia.org/wiki/Carnivora">Carnivora</a>, the upper fourth <a title="Premolar" href="http://en.wikipedia.org/wiki/Premolar">premolar</a> and lower first <a title="Molar (tooth)" href="http://en.wikipedia.org/wiki/Molar_%28tooth%29">molar</a> are adapted as <a title="Carnassial" href="http://en.wikipedia.org/wiki/Carnassial">carnassial</a> teeth for slicing flesh. The molar teeth are strong in most species, allowing the animals to crack open bone to reach the <a title="Bone marrow" href="http://en.wikipedia.org/wiki/Bone_marrow">marrow</a>. The deciduous or baby teeth formula in canids is 3 1 3; molars are completely absent. <a id="Canids_and_humans" name="Canids_and_humans"></a></p>\n<h2><span class="editsection">[<a title="Edit section: Canids and humans" href="http://en.wikipedia.org/w/index.php?title=Canidae&amp;action=edit&amp;section=12">edit</a>]</span> <span class="mw-headline">Canids and humans</span></h2>\n<div class="thumb tright">\n<div class="thumbinner" style="width: 182px;"><a class="image" title="Traditional English fox hunt" href="http://en.wikipedia.org/wiki/File:BedaleHunt2005.jpg"><img class="thumbimage" src="http://upload.wikimedia.org/wikipedia/en/thumb/6/65/BedaleHunt2005.jpg/180px-BedaleHunt2005.jpg" alt="" width="180" height="118" /></a>\n<div class="thumbcaption">\n<div class="magnify"><a class="internal" title="Enlarge" href="http://en.wikipedia.org/wiki/File:BedaleHunt2005.jpg"><img src="http://en.wikipedia.org/skins-1.5/common/images/magnify-clip.png" alt="" width="15" height="11" /></a></div>\nTraditional English <a class="mw-redirect" title="Fox hunt" href="http://en.wikipedia.org/wiki/Fox_hunt">fox hunt</a></div>\n</div>\n</div>\n<p>One canid, the domestic dog, long ago entered into a partnership with humans and today remains one of the most widely kept domestic animals in the world and serves humanity in a great many important ways. Most experts believe the domestic dog is descended from an Asian subspecies of the Gray Wolf.</p>\n<p>Among canids, only the gray wolf has been known to prey on humans.<sup id="cite_ref-12" class="reference"><a href="http://en.wikipedia.org/wiki/Canidae#cite_note-12"><span>[</span>13<span>]</span></a></sup> There is at least <a class="mw-redirect" title="Kelly Keen Coyote Attack" href="http://en.wikipedia.org/wiki/Kelly_Keen_Coyote_Attack">one record</a> of a coyote killing a toddler,<sup id="cite_ref-AOH_13-0" class="reference"><a href="http://en.wikipedia.org/wiki/Canidae#cite_note-AOH-13"><span>[</span>14<span>]</span></a></sup> and two of golden jackals killing children.<sup id="cite_ref-CWC_14-0" class="reference"><a href="http://en.wikipedia.org/wiki/Canidae#cite_note-CWC-14"><span>[</span>15<span>]</span></a></sup> Some canid species have also been trapped and hunted for their fur and, especially the Gray Wolf and the Red Fox, for sport. Some canids are now endangered in the wild due to hunting, habitat loss, and the introduction of diseases from domestic dogs.<sup id="cite_ref-15" class="reference"><a href="http://en.wikipedia.org/wiki/Canidae#cite_note-15"><span>[</span>16<span>]</span></a></sup></p>\n<p><a id="Species_and_taxonomy" name="Species_and_taxonomy"></a></p>\n<h2><span class="editsection">[<a title="Edit section: Species and taxonomy" href="http://en.wikipedia.org/w/index.php?title=Canidae&amp;action=edit&amp;section=13">edit</a>]</span> <span class="mw-headline">Species and taxonomy</span></h2>\n<div class="thumb tright">\n<div class="thumbinner" style="width: 182px;"><a class="image" title="Coyote" href="http://en.wikipedia.org/wiki/File:Canis_latrans_standing.jpg"><img class="thumbimage" src="http://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Canis_latrans_standing.jpg/180px-Canis_latrans_standing.jpg" alt="" width="180" height="121" /></a>\n<div class="thumbcaption">\n<div class="magnify"><a class="internal" title="Enlarge" href="http://en.wikipedia.org/wiki/File:Canis_latrans_standing.jpg"><img src="http://en.wikipedia.org/skins-1.5/common/images/magnify-clip.png" alt="" width="15" height="11" /></a></div>\n<a title="Coyote" href="http://en.wikipedia.org/wiki/Coyote">Coyote</a></div>\n</div>\n</div>\n<div class="thumb tright">\n<div class="thumbinner" style="width: 182px;"><a class="image" title="African Hunting Dog" href="http://en.wikipedia.org/wiki/File:Lycaon_pictus_pg.jpg"><img class="thumbimage" src="http://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Lycaon_pictus_pg.jpg/180px-Lycaon_pictus_pg.jpg" alt="" width="180" height="135" /></a>\n<div class="thumbcaption">\n<div class="magnify"><a class="internal" title="Enlarge" href="http://en.wikipedia.org/wiki/File:Lycaon_pictus_pg.jpg"><img src="http://en.wikipedia.org/skins-1.5/common/images/magnify-clip.png" alt="" width="15" height="11" /></a></div>\n<a class="mw-redirect" title="African Hunting Dog" href="http://en.wikipedia.org/wiki/African_Hunting_Dog">African Hunting Dog</a></div>\n</div>\n</div>\n<div class="thumb tright">\n<div class="thumbinner" style="width: 182px;"><a class="image" title="Red Fox" href="http://en.wikipedia.org/wiki/File:Vulpes_vulpes.jpg"><img class="thumbimage" src="http://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Vulpes_vulpes.jpg/180px-Vulpes_vulpes.jpg" alt="" width="180" height="120" /></a>\n<div class="thumbcaption">\n<div class="magnify"><a class="internal" title="Enlarge" href="http://en.wikipedia.org/wiki/File:Vulpes_vulpes.jpg"><img src="http://en.wikipedia.org/skins-1.5/common/images/magnify-clip.png" alt="" width="15" height="11" /></a></div>\n<a title="Red Fox" href="http://en.wikipedia.org/wiki/Red_Fox">Red Fox</a></div>\n</div>\n</div>\n<div class="thumb tright">\n<div class="thumbinner" style="width: 182px;"><a class="image" title="Red Wolf" href="http://en.wikipedia.org/wiki/File:07-03-23RedWolfAlbanyGAChehaw.jpg"><img class="thumbimage" src="http://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/07-03-23RedWolfAlbanyGAChehaw.jpg/180px-07-03-23RedWolfAlbanyGAChehaw.jpg" alt="" width="180" height="150" /></a>\n<div class="thumbcaption">\n<div class="magnify"><a class="internal" title="Enlarge" href="http://en.wikipedia.org/wiki/File:07-03-23RedWolfAlbanyGAChehaw.jpg"><img src="http://en.wikipedia.org/skins-1.5/common/images/magnify-clip.png" alt="" width="15" height="11" /></a></div>\n<a title="Red Wolf" href="http://en.wikipedia.org/wiki/Red_Wolf">Red Wolf</a></div>\n</div>\n</div>\n<div class="thumb tright">\n<div class="thumbinner" style="width: 182px;"><a class="image" title="Dhole" href="http://en.wikipedia.org/wiki/File:Cuon.alpinus-ZOO.Olomouc.jpg"><img class="thumbimage" src="http://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Cuon.alpinus-ZOO.Olomouc.jpg/180px-Cuon.alpinus-ZOO.Olomouc.jpg" alt="" width="180" height="116" /></a>\n<div class="thumbcaption">\n<div class="magnify"><a class="internal" title="Enlarge" href="http://en.wikipedia.org/wiki/File:Cuon.alpinus-ZOO.Olomouc.jpg"><img src="http://en.wikipedia.org/skins-1.5/common/images/magnify-clip.png" alt="" width="15" height="11" /></a></div>\n<a title="Dhole" href="http://en.wikipedia.org/wiki/Dhole">Dhole</a></div>\n</div>\n</div>\n<div class="thumb tright">\n<div class="thumbinner" style="width: 182px;"><a class="image" title="Golden Jackal" href="http://en.wikipedia.org/wiki/File:Golden_Jackal2.jpg"><img class="thumbimage" src="http://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Golden_Jackal2.jpg/180px-Golden_Jackal2.jpg" alt="" width="180" height="120" /></a>\n<div class="thumbcaption">\n<div class="magnify"><a class="internal" title="Enlarge" href="http://en.wikipedia.org/wiki/File:Golden_Jackal2.jpg"><img src="http://en.wikipedia.org/skins-1.5/common/images/magnify-clip.png" alt="" width="15" height="11" /></a></div>\n<a title="Golden Jackal" href="http://en.wikipedia.org/wiki/Golden_Jackal">Golden Jackal</a></div>\n</div>\n</div>\n<div class="thumb tright">\n<div class="thumbinner" style="width: 182px;"><a class="image" title="Bat-eared Fox" href="http://en.wikipedia.org/wiki/File:Otocyon_megalotis_%28Namibia%29.jpg"><img class="thumbimage" src="http://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Otocyon_megalotis_%28Namibia%29.jpg/180px-Otocyon_megalotis_%28Namibia%29.jpg" alt="" width="180" height="135" /></a>\n<div class="thumbcaption">\n<div class="magnify"><a class="internal" title="Enlarge" href="http://en.wikipedia.org/wiki/File:Otocyon_megalotis_%28Namibia%29.jpg"><img src="http://en.wikipedia.org/skins-1.5/common/images/magnify-clip.png" alt="" width="15" height="11" /></a></div>\n<a title="Bat-eared Fox" href="http://en.wikipedia.org/wiki/Bat-eared_Fox">Bat-eared Fox</a></div>\n</div>\n</div>\n<div class="thumb tright">\n<div class="thumbinner" style="width: 182px;"><a class="image" title="Gray Fox" href="http://en.wikipedia.org/wiki/File:Grey_fox_small.jpg"><img class="thumbimage" src="http://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Grey_fox_small.jpg/180px-Grey_fox_small.jpg" alt="" width="180" height="118" /></a>\n<div class="thumbcaption">\n<div class="magnify"><a class="internal" title="Enlarge" href="http://en.wikipedia.org/wiki/File:Grey_fox_small.jpg"><img src="http://en.wikipedia.org/skins-1.5/common/images/magnify-clip.png" alt="" width="15" height="11" /></a></div>\n<a title="Gray Fox" href="http://en.wikipedia.org/wiki/Gray_Fox">Gray Fox</a></div>\n</div>\n</div>\n<div class="thumb tright">\n<div class="thumbinner" style="width: 182px;"><a class="image" title="Maned Wolf" href="http://en.wikipedia.org/wiki/File:ZooManedWolf.jpg"><img class="thumbimage" src="http://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/ZooManedWolf.jpg/180px-ZooManedWolf.jpg" alt="" width="180" height="133" /></a>\n<div class="thumbcaption">\n<div class="magnify"><a class="internal" title="Enlarge" href="http://en.wikipedia.org/wiki/File:ZooManedWolf.jpg"><img src="http://en.wikipedia.org/skins-1.5/common/images/magnify-clip.png" alt="" width="15" height="11" /></a></div>\n<a title="Maned Wolf" href="http://en.wikipedia.org/wiki/Maned_Wolf">Maned Wolf</a></div>\n</div>\n</div>\n<div class="thumb tright">\n<div class="thumbinner" style="width: 182px;"><a class="image" title="Short-eared Dog" href="http://en.wikipedia.org/wiki/File:Short-eared_Dog.jpg"><img class="thumbimage" src="http://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Short-eared_Dog.jpg/180px-Short-eared_Dog.jpg" alt="" width="180" height="131" /></a>\n<div class="thumbcaption">\n<div class="magnify"><a class="internal" title="Enlarge" href="http://en.wikipedia.org/wiki/File:Short-eared_Dog.jpg"><img src="http://en.wikipedia.org/skins-1.5/common/images/magnify-clip.png" alt="" width="15" height="11" /></a></div>\n<a title="Short-eared Dog" href="http://en.wikipedia.org/wiki/Short-eared_Dog">Short-eared Dog</a></div>\n</div>\n</div>\n<div class="thumb tright">\n<div class="thumbinner" style="width: 182px;"><a class="image" title="Pampas Fox" href="http://en.wikipedia.org/wiki/File:Zoo_Am%C3%A9rica-2874f-Urocyon_cinereoargenteus.jpg"><img class="thumbimage" src="http://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Zoo_Am%C3%A9rica-2874f-Urocyon_cinereoargenteus.jpg/180px-Zoo_Am%C3%A9rica-2874f-Urocyon_cinereoargenteus.jpg" alt="" width="180" height="120" /></a>\n<div class="thumbcaption">\n<div class="magnify"><a class="internal" title="Enlarge" href="http://en.wikipedia.org/wiki/File:Zoo_Am%C3%A9rica-2874f-Urocyon_cinereoargenteus.jpg"><img src="http://en.wikipedia.org/skins-1.5/common/images/magnify-clip.png" alt="" width="15" height="11" /></a></div>\n<a title="Pampas Fox" href="http://en.wikipedia.org/wiki/Pampas_Fox">Pampas Fox</a></div>\n</div>\n</div>\n<div class="thumb tright">\n<div class="thumbinner" style="width: 182px;"><a class="image" title="Arctic Fox" href="http://en.wikipedia.org/wiki/File:Polarfuchs_1_2004-11-17.jpg"><img class="thumbimage" src="http://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Polarfuchs_1_2004-11-17.jpg/180px-Polarfuchs_1_2004-11-17.jpg" alt="" width="180" height="140" /></a>\n<div class="thumbcaption">\n<div class="magnify"><a class="internal" title="Enlarge" href="http://en.wikipedia.org/wiki/File:Polarfuchs_1_2004-11-17.jpg"><img src="http://en.wikipedia.org/skins-1.5/common/images/magnify-clip.png" alt="" width="15" height="11" /></a></div>\n<a title="Arctic Fox" href="http://en.wikipedia.org/wiki/Arctic_Fox">Arctic Fox</a></div>\n</div>\n</div>\n<div class="thumb tright">\n<div class="thumbinner" style="width: 182px;"><a class="image" title="Raccoon Dog" href="http://en.wikipedia.org/wiki/File:Tanuki01_960.jpg"><img class="thumbimage" src="http://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Tanuki01_960.jpg/180px-Tanuki01_960.jpg" alt="" width="180" height="101" /></a>\n<div class="thumbcaption">\n<div class="magnify"><a class="internal" title="Enlarge" href="http://en.wikipedia.org/wiki/File:Tanuki01_960.jpg"><img src="http://en.wikipedia.org/skins-1.5/common/images/magnify-clip.png" alt="" width="15" height="11" /></a></div>\n<a title="Raccoon Dog" href="http://en.wikipedia.org/wiki/Raccoon_Dog">Raccoon Dog</a></div>\n</div>\n</div>\n<div class="thumb tright">\n<div class="thumbinner" style="width: 182px;"><a class="image" title="A modern domesticated West Highland White Terrier" href="http://en.wikipedia.org/wiki/File:West_Highland_White_Terrier_Krakow.jpg"><img class="thumbimage" src="http://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/West_Highland_White_Terrier_Krakow.jpg/180px-West_Highland_White_Terrier_Krakow.jpg" alt="" width="180" height="151" /></a>\n<div class="thumbcaption">\n<div class="magnify"><a class="internal" title="Enlarge" href="http://en.wikipedia.org/wiki/File:West_Highland_White_Terrier_Krakow.jpg"><img src="http://en.wikipedia.org/skins-1.5/common/images/magnify-clip.png" alt="" width="15" height="11" /></a></div>\nA modern domesticated <a title="West Highland White Terrier" href="http://en.wikipedia.org/wiki/West_Highland_White_Terrier">West Highland White Terrier</a></div>\n</div>\n</div>\n<p><strong>FAMILY CANIDAE</strong></p>\n<p><a id="Subfamily_Caninae" name="Subfamily_Caninae"></a></p>\n<h3><span class="editsection">[<a title="Edit section: Subfamily Caninae" href="http://en.wikipedia.org/w/index.php?title=Canidae&amp;action=edit&amp;section=14">edit</a>]</span> <span class="mw-headline">Subfamily Caninae</span></h3>\n<ul>\n<li><strong>True dogs</strong> - Tribe Canini \n<ul>\n<li><em>Genus <a title="Canis" href="http://en.wikipedia.org/wiki/Canis">Canis</a></em> \n<ul>\n<li><a title="Side-striped Jackal" href="http://en.wikipedia.org/wiki/Side-striped_Jackal">Side-striped Jackal</a>, <em>Canis adustus</em></li>\n<li><a title="Golden Jackal" href="http://en.wikipedia.org/wiki/Golden_Jackal">Golden Jackal</a>, <em>Canis aureus</em></li>\n<li><a title="Himalayan Wolf" href="http://en.wikipedia.org/wiki/Himalayan_Wolf">Himalayan Wolf</a>, <em>Canis himalayensis</em> (sometimes considered as gray wolf species)</li>\n<li><a title="Indian Wolf" href="http://en.wikipedia.org/wiki/Indian_Wolf">Indian Wolf</a>, <em>Canis indica</em> (sometimes considered as gray wolf species)</li>\n<li><a title="Coyote" href="http://en.wikipedia.org/wiki/Coyote">Coyote</a>, <em>Canis latrans</em> (also called Prairie Wolf)</li>\n<li><a title="Egyptian jackal" href="http://en.wikipedia.org/wiki/Egyptian_jackal">Deeb</a>, <em>Canis lupaster</em></li>\n<li><a title="Gray Wolf" href="http://en.wikipedia.org/wiki/Gray_Wolf">Gray Wolf</a>, <em>Canis lupus</em> (2.723 Ma to present) \n<ul>\n<li><a title="Dog" href="http://en.wikipedia.org/wiki/Dog">Domestic Dog</a>, <em>Canis lupus familiaris</em></li>\n<li><a title="Dingo" href="http://en.wikipedia.org/wiki/Dingo">Dingo</a>, most often classified as <em>Canis lupus dingo</em> (sometimes considered a separate taxon)</li>\n<li><a title="New Guinea Singing Dog" href="http://en.wikipedia.org/wiki/New_Guinea_Singing_Dog">New Guinea Singing Dog</a>, <em>Canis lupus hallstromi</em></li>\n<li>many other proposed subspecies</li>\n</ul>\n</li>\n<li><a title="Red Wolf" href="http://en.wikipedia.org/wiki/Red_Wolf">Red Wolf</a>, <em>Canis rufus</em> (3 Ma to present) \n<ul>\n<li><a title="Eastern Wolf" href="http://en.wikipedia.org/wiki/Eastern_Wolf">Eastern Wolf</a>, <em>Canis (rufus) lycaon</em> (sometimes considered a separate species)</li>\n</ul>\n</li>\n<li><a title="Black-backed Jackal" href="http://en.wikipedia.org/wiki/Black-backed_Jackal">Black-backed Jackal</a>, <em>Canis mesomelas</em></li>\n<li><a title="Ethiopian Wolf" href="http://en.wikipedia.org/wiki/Ethiopian_Wolf">Ethiopian Wolf</a>, <em>Canis simensis</em> (also called Abyssinian Wolf, Simien Fox and Simien Jackal)</li>\n</ul>\n</li>\n<li><em>Genus Cuon</em> \n<ul>\n<li><a title="Dhole" href="http://en.wikipedia.org/wiki/Dhole">Dhole</a>, <em>Cuon alpinus</em> or <em>Canis alpinus</em> (also called Asian Wild Dog)</li>\n</ul>\n</li>\n<li><em>Genus Lycaon</em> \n<ul>\n<li><a title="African Wild Dog" href="http://en.wikipedia.org/wiki/African_Wild_Dog">African Wild Dog</a>, <em>Lycaon pictus</em> (also called African Hunting Dog)</li>\n</ul>\n</li>\n<li><em>Genus Atelocynus</em> \n<ul>\n<li><a title="Short-eared Dog" href="http://en.wikipedia.org/wiki/Short-eared_Dog">Short-eared Dog</a>, <em>Atelocynus microtis</em></li>\n</ul>\n</li>\n<li><em>Genus Cerdocyon</em> \n<ul>\n<li><a title="Crab-eating Fox" href="http://en.wikipedia.org/wiki/Crab-eating_Fox">Crab-eating Fox</a>, <em>Cerdocyon thous</em></li>\n</ul>\n</li>\n<li><em>Genus Dasycyon</em> <a title="Extinction" href="http://en.wikipedia.org/wiki/Extinction">&dagger;</a>&nbsp;? \n<ul>\n<li><a class="mw-redirect" title="Andean wolf" href="http://en.wikipedia.org/wiki/Andean_wolf">Hagenbeck Wolf</a>, <em>Dasycyon hagenbecki</em> &dagger;&nbsp;?</li>\n</ul>\n</li>\n<li><em>Genus Dusicyon</em> <a title="Extinction" href="http://en.wikipedia.org/wiki/Extinction">&dagger;</a> \n<ul>\n<li><a class="mw-redirect" title="Falkland Island fox" href="http://en.wikipedia.org/wiki/Falkland_Island_fox">Falkland Island Fox</a>, <em>Dusicyon australis</em> <a title="Extinction" href="http://en.wikipedia.org/wiki/Extinction">&dagger;</a></li>\n</ul>\n</li>\n<li><em>Genus <a class="mw-redirect" title="Pseudalopex" href="http://en.wikipedia.org/wiki/Pseudalopex">Pseudalopex</a></em> \n<ul>\n<li><a title="Culpeo" href="http://en.wikipedia.org/wiki/Culpeo">Culpeo</a>, <em>Pseudalopex culpaeus</em></li>\n<li><a title="Darwin''s Fox" href="http://en.wikipedia.org/wiki/Darwin%27s_Fox">Darwin''s Fox</a>, <em>Pseudalopex fulvipes</em></li>\n<li><a class="mw-redirect" title="Argentine Grey Fox" href="http://en.wikipedia.org/wiki/Argentine_Grey_Fox">Argentine Grey Fox</a>, <em>Pseudalopex griseus</em></li>\n<li><a title="Pampas Fox" href="http://en.wikipedia.org/wiki/Pampas_Fox">Pampas Fox</a>, <em>Pseudalopex gymnocercus</em></li>\n<li><a class="mw-redirect" title="Sechura Fox" href="http://en.wikipedia.org/wiki/Sechura_Fox">Sechura Fox</a>, <em>Pseudalopex sechurae</em></li>\n<li><a title="Hoary Fox" href="http://en.wikipedia.org/wiki/Hoary_Fox">Hoary Fox</a>, <em>Pseudalopex vetulus</em></li>\n<li><a class="new" title="Mendoza Fox (page does not exist)" href="http://en.wikipedia.org/w/index.php?title=Mendoza_Fox&amp;action=edit&amp;redlink=1">Mendoza Fox</a>, <em>Pseudalopex sp.?</em></li>\n</ul>\n</li>\n<li><em>Genus Chrysocyon</em> \n<ul>\n<li><a title="Maned Wolf" href="http://en.wikipedia.org/wiki/Maned_Wolf">Maned Wolf</a>, <em>Chrysocyon brachyurus</em></li>\n</ul>\n</li>\n<li><em>Genus Speothos</em> \n<ul>\n<li><a title="Bush Dog" href="http://en.wikipedia.org/wiki/Bush_Dog">Bush Dog</a>, <em>Speothos venaticus</em></li>\n<li><a title="Speothos pacivorus" href="http://en.wikipedia.org/wiki/Speothos_pacivorus">Unnamed bush dog relative</a>, <em>Speothos pacivorus</em> &dagger;</li>\n</ul>\n</li>\n</ul>\n</li>\n</ul>\n<ul>\n<li><strong>True foxes</strong> - Tribe Vulpini \n<ul>\n<li><em>Genus <a title="Vulpes" href="http://en.wikipedia.org/wiki/Vulpes">Vulpes</a></em> \n<ul>\n<li><a title="Arctic Fox" href="http://en.wikipedia.org/wiki/Arctic_Fox">Arctic Fox</a>, <em>Vulpes lagopus</em></li>\n<li><a title="Red Fox" href="http://en.wikipedia.org/wiki/Red_Fox">Red Fox</a>, <em>Vulpes vulpes</em> (1 Ma to present)</li>\n<li><a title="Swift Fox" href="http://en.wikipedia.org/wiki/Swift_Fox">Swift Fox</a>, <em>Vulpes velox</em></li>\n<li><a title="Kit Fox" href="http://en.wikipedia.org/wiki/Kit_Fox">Kit Fox</a>, <em>Vulpes macrotis</em></li>\n<li><a title="Corsac Fox" href="http://en.wikipedia.org/wiki/Corsac_Fox">Corsac Fox</a>, <em>Vulpes corsac</em></li>\n<li><a title="Cape Fox" href="http://en.wikipedia.org/wiki/Cape_Fox">Cape Fox</a>, <em>Vulpes chama</em></li>\n<li><a title="Pale Fox" href="http://en.wikipedia.org/wiki/Pale_Fox">Pale Fox</a>, <em>Vulpes pallida</em></li>\n<li><a title="Bengal Fox" href="http://en.wikipedia.org/wiki/Bengal_Fox">Bengal Fox</a>, <em>Vulpes bengalensis</em></li>\n<li><a title="Tibetan Sand Fox" href="http://en.wikipedia.org/wiki/Tibetan_Sand_Fox">Tibetan Sand Fox</a>, <em>Vulpes ferrilata</em></li>\n<li><a title="Blanford''s Fox" href="http://en.wikipedia.org/wiki/Blanford%27s_Fox">Blanford''s Fox</a>, <em>Vulpes cana</em></li>\n<li><a title="R&uuml;ppell''s Fox" href="http://en.wikipedia.org/wiki/R%C3%BCppell%27s_Fox">R&uuml;ppell''s Fox</a>, <em>Vulpes rueppelli</em></li>\n<li><a title="Fennec Fox" href="http://en.wikipedia.org/wiki/Fennec_Fox">Fennec Fox</a>, <em>Vulpes zerda</em></li>\n</ul>\n</li>\n<li><em>Genus <a title="Urocyon" href="http://en.wikipedia.org/wiki/Urocyon">Urocyon</a></em> (2 Ma to present) \n<ul>\n<li><a title="Gray Fox" href="http://en.wikipedia.org/wiki/Gray_Fox">Gray Fox</a>, <em>U. cinereoargenteus</em></li>\n<li><a title="Island Fox" href="http://en.wikipedia.org/wiki/Island_Fox">Island Fox</a>, <em>U. littoralis</em></li>\n<li><a title="Cozumel Fox" href="http://en.wikipedia.org/wiki/Cozumel_Fox">Cozumel Fox</a>, <em>U</em>. sp.</li>\n</ul>\n</li>\n</ul>\n</li>\n</ul>\n<ul>\n<li><strong>Basal Caninae</strong> \n<ul>\n<li><em>Genus Otocyon</em> (probably a vulpine close to <em>Urocyon</em>) \n<ul>\n<li><a title="Bat-eared Fox" href="http://en.wikipedia.org/wiki/Bat-eared_Fox">Bat-eared Fox</a>, <em>Otocyon megalotis</em></li>\n</ul>\n</li>\n<li><em>Genus <a title="Nyctereutes" href="http://en.wikipedia.org/wiki/Nyctereutes">Nyctereutes</a></em> \n<ul>\n<li><a title="Raccoon Dog" href="http://en.wikipedia.org/wiki/Raccoon_Dog">Raccoon Dog</a>, <em>Nyctereutes procyonoides</em></li>\n</ul>\n</li>\n</ul>\n</li>\n</ul>\n<p><a id="Fossil_Canidae" name="Fossil_Canidae"></a></p>\n<h2><span class="editsection">[<a title="Edit section: Fossil Canidae" href="http://en.wikipedia.org/w/index.php?title=Canidae&amp;action=edit&amp;section=15">edit</a>]</span> <span class="mw-headline">Fossil Canidae</span></h2>\n<p>Classification of Hesperocyoninae from Wang (1994)<sup id="cite_ref-Hesperocyoninae_16-0" class="reference"><a href="http://en.wikipedia.org/wiki/Canidae#cite_note-Hesperocyoninae-16"><span>[</span>17<span>]</span></a></sup> and Borophaginae from Wang et al. (1999),<sup id="cite_ref-Borophaginae_17-0" class="reference"><a href="http://en.wikipedia.org/wiki/Canidae#cite_note-Borophaginae-17"><span>[</span>18<span>]</span></a></sup> except where noted.</p>', 1, NULL, NULL, '2009-08-06 17:44:19', '2009-08-06 17:45:34', 0, '43df3804d4603844f5307712984d03d7f2459f15', 0, 0, 0),
(64, 'bears', 'Bears', '<p><strong>Bears</strong> are <a title="Mammal" href="http://en.wikipedia.org/wiki/Mammal">mammals</a> of the <a title="Family (biology)" href="http://en.wikipedia.org/wiki/Family_%28biology%29">family</a> <strong>Ursidae</strong>. Bears are classified as <a class="mw-redirect" title="Caniform" href="http://en.wikipedia.org/wiki/Caniform">caniforms</a>, or doglike carnivorans, with the <a title="Pinniped" href="http://en.wikipedia.org/wiki/Pinniped">pinnipeds</a> being their closest living relatives. Although there are only eight living <a title="Species" href="http://en.wikipedia.org/wiki/Species">species</a> of bear, they are widespread, appearing in a wide variety of <a title="Habitat" href="http://en.wikipedia.org/wiki/Habitat">habitats</a> throughout the <a title="Northern Hemisphere" href="http://en.wikipedia.org/wiki/Northern_Hemisphere">Northern Hemisphere</a> and partially in the <a title="Southern Hemisphere" href="http://en.wikipedia.org/wiki/Southern_Hemisphere">Southern Hemisphere</a>. That which pertains to bears is called <em>ursine</em>. Bears are found in the <a title="Continent" href="http://en.wikipedia.org/wiki/Continent">continents</a> of <a title="North America" href="http://en.wikipedia.org/wiki/North_America">North America</a>, <a title="South America" href="http://en.wikipedia.org/wiki/South_America">South America</a>, <a title="Europe" href="http://en.wikipedia.org/wiki/Europe">Europe</a>, and <a title="Asia" href="http://en.wikipedia.org/wiki/Asia">Asia</a>.</p>\n<p>Common characteristics of modern bears include a large body with stocky legs, a long snout, shaggy hair, <a title="Plantigrade" href="http://en.wikipedia.org/wiki/Plantigrade">plantigrade</a> paws with five nonretractile claws, and a short tail. While the <a title="Polar bear" href="http://en.wikipedia.org/wiki/Polar_bear">polar bear</a> is mostly carnivorous and the <a class="mw-redirect" title="Giant panda" href="http://en.wikipedia.org/wiki/Giant_panda">giant panda</a> feeds almost entirely on <a title="Bamboo" href="http://en.wikipedia.org/wiki/Bamboo">bamboo</a>, the remaining six species are omnivorous, with largely varied diets including both plants and animals.</p>\n<p>With the exceptions of <a title="Mating" href="http://en.wikipedia.org/wiki/Mating">courting</a> individuals and mothers with their young, bears are typically solitary animals. They are generally <a title="Diurnality" href="http://en.wikipedia.org/wiki/Diurnality">diurnal</a>, but may be active during the night (<a class="mw-redirect" title="Nocturnal" href="http://en.wikipedia.org/wiki/Nocturnal">nocturnal</a>) or twilight (<a title="Crepuscular" href="http://en.wikipedia.org/wiki/Crepuscular">crepuscular</a>), particularly around humans. Bears are aided by an excellent <a title="Olfaction" href="http://en.wikipedia.org/wiki/Olfaction">sense of smell</a>, and despite their heavy build and awkward gait, they can run quickly and are adept climbers and swimmers. In autumn some bear species forage large amounts of fermented fruits which affects their behaviour.<sup id="cite_ref-0" class="reference"><a href="http://en.wikipedia.org/wiki/Bears#cite_note-0"><span>[</span>1<span>]</span></a></sup> Bears use shelters such as caves and burrows as their dens, which are occupied by most species during the winter for a long period of sleep similar to <a title="Hibernation" href="http://en.wikipedia.org/wiki/Hibernation">hibernation</a>.</p>\n<p>Bears have been hunted since <a class="mw-redirect" title="Prehistoric" href="http://en.wikipedia.org/wiki/Prehistoric">prehistoric</a> times for their meat and fur. To this day, they play a prominent role in the <a class="mw-redirect" title="The Arts" href="http://en.wikipedia.org/wiki/The_Arts">arts</a>, <a title="Mythology" href="http://en.wikipedia.org/wiki/Mythology">mythology</a>, and other cultural aspects of various human societies. In modern times, the bear''s existence has been pressured through the encroachment on its habitats and the illegal trade of bears and bear parts, including the <a title="Asia" href="http://en.wikipedia.org/wiki/Asia">Asian</a> <a title="Bile bear" href="http://en.wikipedia.org/wiki/Bile_bear">bile bear</a> market. The <a class="mw-redirect" title="World Conservation Union" href="http://en.wikipedia.org/wiki/World_Conservation_Union">IUCN</a> lists six bear species as <a title="Vulnerable species" href="http://en.wikipedia.org/wiki/Vulnerable_species">vulnerable</a> or <a title="Endangered species" href="http://en.wikipedia.org/wiki/Endangered_species">endangered</a>, and even "<a class="mw-redirect" title="Least concern" href="http://en.wikipedia.org/wiki/Least_concern">least concern</a>" species such as the <a class="mw-redirect" title="Brown bear" href="http://en.wikipedia.org/wiki/Brown_bear">brown bear</a> are at risk of <a class="mw-redirect" title="Extirpation" href="http://en.wikipedia.org/wiki/Extirpation">extirpation</a> in certain countries. The poaching and international trade of these most threatened populations is prohibited, but still ongoing.</p>', 1, NULL, NULL, '2009-08-06 17:46:10', '2009-08-06 17:46:37', 0, 'f369c8a5cb0955f1fd259deaed66246d148889e1', 0, 0, 1);
INSERT INTO `posts` (`id`, `slug`, `title`, `content`, `user_id`, `description_meta_tag`, `keywords_meta_tag`, `created`, `updated`, `draft`, `uuid`, `comments_closed`, `comments_allowed`, `comment_count`) VALUES
(66, 'sharks-1', 'Sharks', '<div class="exerpt">\n<p><strong>Sharks</strong> (<a class="mw-redirect" title="Superorder" href="http://en.wikipedia.org/wiki/Superorder">superorder</a> <strong>Selachimorpha</strong>) are a type of <a title="Fish" href="http://en.wikipedia.org/wiki/Fish">fish</a> with a full <a title="Cartilage" href="http://en.wikipedia.org/wiki/Cartilage">cartilaginous</a> <a title="Skeleton" href="http://en.wikipedia.org/wiki/Skeleton">skeleton</a> and a highly <a class="mw-redirect" title="Streamlines, streaklines and pathlines" href="http://en.wikipedia.org/wiki/Streamlines,_streaklines_and_pathlines">streamlined</a> body. They respire with the use of five to seven <a title="Gill" href="http://en.wikipedia.org/wiki/Gill">gill</a> slits. Sharks have a covering of <a title="Dermal denticle" href="http://en.wikipedia.org/wiki/Dermal_denticle">dermal denticles</a> that protect their skin from damage and <a class="mw-redirect" title="Parasite" href="http://en.wikipedia.org/wiki/Parasite">parasites</a> and improves <a title="Fluid dynamics" href="http://en.wikipedia.org/wiki/Fluid_dynamics">fluid dynamics</a> so the shark can move faster. They have several sets of replaceable teeth.<sup id="cite_ref-Budker_0-0" class="reference"><a href="http://en.wikipedia.org/wiki/Shark#cite_note-Budker-0"><span>[</span>1<span>]</span></a></sup> Sharks range in size from the small <a title="Dwarf lanternshark" href="http://en.wikipedia.org/wiki/Dwarf_lanternshark">dwarf lanternshark</a>, <em>Etmopterus perryi</em>, a deep sea species of only 17&nbsp;centimetres (7&nbsp;in) in length, to the <a title="Whale shark" href="http://en.wikipedia.org/wiki/Whale_shark">whale shark</a>, <em>Rhincodon typus</em>, the largest fish, which grows to a length of approximately 12&nbsp;metres (39&nbsp;ft) and which feeds only on <a title="Plankton" href="http://en.wikipedia.org/wiki/Plankton">plankton</a>, <a title="Squid" href="http://en.wikipedia.org/wiki/Squid">squid</a>, and small <a title="Fish" href="http://en.wikipedia.org/wiki/Fish">fish</a> through <a class="mw-redirect" title="Filter feeding" href="http://en.wikipedia.org/wiki/Filter_feeding">filter feeding</a>.</p>\n</div>\n<p>The <a title="Bull shark" href="http://en.wikipedia.org/wiki/Bull_shark">bull shark</a>, <em>Carcharhinus leucas</em>, is the best known of several species that swim in both <a title="Seawater" href="http://en.wikipedia.org/wiki/Seawater">seawater</a> and <a title="Freshwater" href="http://en.wikipedia.org/wiki/Freshwater">freshwater</a>, as well as in <a title="River delta" href="http://en.wikipedia.org/wiki/River_delta">deltas</a>.<a href="http://en.wikipedia.org/wiki/Shark#cite_note-1"><span>[</span>2]</a></p>\n<h2><span class="mw-headline">Etymology</span></h2>\n<p>Until the 16th century,<sup id="cite_ref-2" class="reference"><a href="http://en.wikipedia.org/wiki/Shark#cite_note-2"><span>[</span>3<span>]</span></a></sup> sharks were known to mariners as "sea dogs".<sup id="cite_ref-3" class="reference"><a href="http://en.wikipedia.org/wiki/Shark#cite_note-3"><span>[</span>4<span>]</span></a></sup> According to the <a class="mw-redirect" title="OED" href="http://en.wikipedia.org/wiki/OED">OED</a> the name "shark" first came into use after Sir <a title="John Hawkins" href="http://en.wikipedia.org/wiki/John_Hawkins">John Hawkins</a>'' sailors exhibited one in London in 1569 and used the word to refer to the large sharks of the <a title="Caribbean Sea" href="http://en.wikipedia.org/wiki/Caribbean_Sea">Caribbean Sea</a>, and later as a general term for all sharks. It has also been suggested to be derived from the <a title="Yucatec Maya language" href="http://en.wikipedia.org/wiki/Yucatec_Maya_language">Yucatec Maya</a> word for shark, <em>xok</em>, pronounced [ʃoːk].<sup id="cite_ref-4" class="reference"><a href="http://en.wikipedia.org/wiki/Shark#cite_note-4"><span>[</span>5<span>]</span></a></sup></p>\n<p><a id="Physical_characteristics" name="Physical_characteristics"></a></p>\n<h2><span class="mw-headline">Physical characteristics</span></h2>\n<div class="floatright"><a class="image" title="The major features of sharks" href="http://en.wikipedia.org/wiki/File:Parts_of_a_shark.svg"><img src="http://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Parts_of_a_shark.svg/440px-Parts_of_a_shark.svg.png" alt="The major features of sharks" width="440" height="185" /></a></div>\n<div class="rellink noprint relarticle mainarticle">Main article: <a title="Physical characteristics of sharks" href="http://en.wikipedia.org/wiki/Physical_characteristics_of_sharks">Physical characteristics of sharks</a></div>\n<p><a id="Skeleton" name="Skeleton"></a></p>\n<h3><span class="mw-headline">Skeleton</span></h3>\n<p>The skeleton of a shark is very different from that of <a title="Osteichthyes" href="http://en.wikipedia.org/wiki/Osteichthyes">bony fish</a> and <a title="Tetrapod" href="http://en.wikipedia.org/wiki/Tetrapod">terrestrial vertebrates</a>. Sharks and other <a title="Chondrichthyes" href="http://en.wikipedia.org/wiki/Chondrichthyes">cartilaginous fish</a> (skates and rays) have skeletons made from cartilage, which is a flexible and dense connective tissue, but they are still considered bones. They function in the same way as human bones do. Like its relatives, rays and skates, the shark''s <a title="Jaw" href="http://en.wikipedia.org/wiki/Jaw">jaw</a> is not attached to the <a class="mw-redirect" title="Cranium" href="http://en.wikipedia.org/wiki/Cranium">cranium</a>. The jaw''s surface, like its vertebrae and gill arches, is a skeletal element that needs extra support due to its heavier exposure to physical stress and its need for extra strength. It has therefore a layer of unique and tiny hexagonal plates called "tesserae", crystal blocks of calcium salts arranged as a mosaic.<sup id="cite_ref-5" class="reference"><a href="http://en.wikipedia.org/wiki/Shark#cite_note-5"><span>[</span>6<span>]</span></a></sup> This gives these areas much of the same strength found in real and much heavier bony tissue.</p>\n<p>Generally there is only one layer of tesserae in sharks, but the jaws of large specimens, such as the <a title="Bull shark" href="http://en.wikipedia.org/wiki/Bull_shark">bull shark</a>, <a title="Tiger shark" href="http://en.wikipedia.org/wiki/Tiger_shark">tiger shark</a>, and <a class="mw-redirect" title="The great white shark" href="http://en.wikipedia.org/wiki/The_great_white_shark">the great white shark</a>, have been found to be covered with two to three layers or more, depending on the body size. The jaws of a large white shark may even have up to five layers.</p>\n<p>In the rostrum (snout), the cartilage can be spongy and flexible to absorb the power of impacts.</p>\n<p>The fin skeletons are elongated and supported with soft and unsegmented rays named ceratotrichia, filaments of elastic protein resembling the horny keratin in hair and feathers.</p>', 1, NULL, NULL, '2009-08-06 17:47:30', '2009-08-09 07:11:24', 0, 'd312f498e8c073874591259576b4218cb3b1b1d0', 0, 0, 0),
(67, 'eagle', 'Eagle', '<div class="exerpt">\n<p><strong>Eagles</strong> are large <a title="Bird of prey" href="http://en.wikipedia.org/wiki/Bird_of_prey">birds of prey</a> which are members of the <a title="Bird" href="http://en.wikipedia.org/wiki/Bird">bird</a> family <a title="Accipitridae" href="http://en.wikipedia.org/wiki/Accipitridae">Accipitridae</a>, and belong to several <a title="Genus" href="http://en.wikipedia.org/wiki/Genus">genera</a> which are not necessarily closely related to each other. Most of the more than 60 species occur in <a title="Eurasia" href="http://en.wikipedia.org/wiki/Eurasia">Eurasia</a> and <a title="Africa" href="http://en.wikipedia.org/wiki/Africa">Africa</a>.<sup id="cite_ref-0" class="reference"><a href="http://en.wikipedia.org/wiki/Eagle#cite_note-0"><span>[</span>1<span>]</span></a></sup> Outside this area, just two species (the <a title="Bald Eagle" href="http://en.wikipedia.org/wiki/Bald_Eagle">Bald</a> and <a title="Golden Eagle" href="http://en.wikipedia.org/wiki/Golden_Eagle">Golden Eagles</a>) can be found in the <a class="mw-redirect" title="USA" href="http://en.wikipedia.org/wiki/USA">USA</a> and <a title="Canada" href="http://en.wikipedia.org/wiki/Canada">Canada</a>, nine more in <a title="Central America" href="http://en.wikipedia.org/wiki/Central_America">Central</a> and <a title="South America" href="http://en.wikipedia.org/wiki/South_America">South America</a>, and three in <a title="Australia" href="http://en.wikipedia.org/wiki/Australia">Australia</a>.</p>\n</div>\n<table id="toc" class="toc" border="0" summary="Contents">\n<tbody>\n<tr>\n<td>\n<div id="toctitle">\n<h2>Contents</h2>\n<span class="toctoggle">[<a id="togglelink" class="internal" href="javascript:toggleToc()">hide</a>]</span></div>\n<ul>\n<li class="toclevel-1"><a href="http://en.wikipedia.org/wiki/Eagle#Description"><span class="tocnumber">1</span> <span class="toctext">Description</span></a></li>\n<li class="toclevel-1"><a href="http://en.wikipedia.org/wiki/Eagle#Species"><span class="tocnumber">2</span> <span class="toctext">Species</span></a></li>\n<li class="toclevel-1"><a href="http://en.wikipedia.org/wiki/Eagle#Eagles_in_culture"><span class="tocnumber">3</span> <span class="toctext">Eagles in culture</span></a> \n<ul>\n<li class="toclevel-2"><a href="http://en.wikipedia.org/wiki/Eagle#The_word"><span class="tocnumber">3.1</span> <span class="toctext">The word</span></a></li>\n<li class="toclevel-2"><a href="http://en.wikipedia.org/wiki/Eagle#Eagles_as_national_symbols"><span class="tocnumber">3.2</span> <span class="toctext">Eagles as national symbols</span></a></li>\n<li class="toclevel-2"><a href="http://en.wikipedia.org/wiki/Eagle#In_popular_culture"><span class="tocnumber">3.3</span> <span class="toctext">In popular culture</span></a></li>\n</ul>\n</li>\n<li class="toclevel-1"><a href="http://en.wikipedia.org/wiki/Eagle#References"><span class="tocnumber">4</span> <span class="toctext">References</span></a></li>\n<li class="toclevel-1"><a href="http://en.wikipedia.org/wiki/Eagle#Further_reading"><span class="tocnumber">5</span> <span class="toctext">Further reading</span></a></li>\n<li class="toclevel-1"><a href="http://en.wikipedia.org/wiki/Eagle#External_links"><span class="tocnumber">6</span> <span class="toctext">External links</span></a></li>\n</ul>\n</td>\n</tr>\n</tbody>\n</table>\n<p>\n<script type="text/javascript">// <![CDATA[\n//&lt;![CDATA[\n if (window.showTocToggle) { var tocShowText = "show"; var tocHideText = "hide"; showTocToggle(); } \n//]]&gt;\n// ]]></script>\n</p>\n<p><a id="Description" name="Description"></a></p>\n<h2><span class="editsection">[<a title="Edit section: Description" href="http://en.wikipedia.org/w/index.php?title=Eagle&amp;action=edit&amp;section=1">edit</a>]</span> <span class="mw-headline">Description</span></h2>\n<p>Eagles are differentiated from other birds of prey mainly by their larger size, more powerful build, and heavier head and bill. Even the smallest eagles, like the <a title="Booted Eagle" href="http://en.wikipedia.org/wiki/Booted_Eagle">Booted Eagle</a> (which is comparable in size to a <a title="Common Buzzard" href="http://en.wikipedia.org/wiki/Common_Buzzard">Common Buzzard</a> or <a title="Red-tailed Hawk" href="http://en.wikipedia.org/wiki/Red-tailed_Hawk">Red-tailed Hawk</a>), have relatively longer and more evenly broad wings, and more direct, faster flight. Most eagles are larger than any other raptors apart from the <a title="Vulture" href="http://en.wikipedia.org/wiki/Vulture">vultures</a>. The species called eagle can range in size from the <a title="South Nicobar Serpent-eagle" href="http://en.wikipedia.org/wiki/South_Nicobar_Serpent-eagle">South Nicobar Serpent-eagle</a>, at 500 grams (1.1 pounds) and 40&nbsp;cm (16 in), to the 6.7-kg <a class="mw-redirect" title="Steller''s Sea-Eagle" href="http://en.wikipedia.org/wiki/Steller%27s_Sea-Eagle">Steller''s Sea-Eagle</a> and the 100-cm (39 in) <a title="Philippine Eagle" href="http://en.wikipedia.org/wiki/Philippine_Eagle">Philippine Eagle</a>.</p>\n<p>Like all birds of prey, eagles have very large powerful hooked <a title="Beak" href="http://en.wikipedia.org/wiki/Beak">beaks</a> for tearing flesh from their prey, strong muscular legs, and powerful <a class="mw-redirect" title="Talons" href="http://en.wikipedia.org/wiki/Talons">talons</a> claws. They also have extremely keen eyesight which enables them to spot potential <a class="mw-redirect" title="Prey" href="http://en.wikipedia.org/wiki/Prey">prey</a> from a very long distance.<sup id="cite_ref-1" class="reference"><a href="http://en.wikipedia.org/wiki/Eagle#cite_note-1"><span>[</span>2<span>]</span></a></sup> This keen eyesight is primarily contributed by their extremely large pupils which ensure minimal <a title="Diffraction" href="http://en.wikipedia.org/wiki/Diffraction">diffraction</a> (scattering) of the incoming light.</p>\n<p>Eagles build their nests, called <a class="mw-redirect" title="Eyrie (nest)" href="http://en.wikipedia.org/wiki/Eyrie_%28nest%29">eyries</a>, in tall trees or on high <a title="Cliff" href="http://en.wikipedia.org/wiki/Cliff">cliffs</a>. Many species lay two eggs, but the older, larger chick frequently kills its younger sibling once it has hatched.</p>', 1, NULL, NULL, '2009-08-06 17:52:55', '2009-08-09 07:14:05', 0, '0c94bae2dd588b5a1fc5d038dc9cece315f8d3d8', 0, 0, 0),
(68, 'crocodiles', 'Crocodiles', '<div class="exerpt">\n<p>A <strong>crocodile</strong> is any <a title="Species" href="http://en.wikipedia.org/wiki/Species">species</a> belonging to the <a title="Family (biology)" href="http://en.wikipedia.org/wiki/Family_%28biology%29">family</a> <strong>Crocodylidae</strong> (sometimes classified instead as the <a class="mw-redirect" title="Subfamily" href="http://en.wikipedia.org/wiki/Subfamily">subfamily</a> <strong>Crocodylinae</strong>). The term can also be used more loosely to include all members of the <a title="Order (biology)" href="http://en.wikipedia.org/wiki/Order_%28biology%29">order</a> <a title="Crocodilia" href="http://en.wikipedia.org/wiki/Crocodilia">Crocodilia</a>: i.e. the true crocodiles, the <a title="Alligator" href="http://en.wikipedia.org/wiki/Alligator">alligators</a> and <a class="mw-redirect" title="Caiman" href="http://en.wikipedia.org/wiki/Caiman">caimans</a> (family <a title="Alligatoridae" href="http://en.wikipedia.org/wiki/Alligatoridae">Alligatoridae</a>) and the <a title="Gharial" href="http://en.wikipedia.org/wiki/Gharial">gharials</a> (family <a title="Gavialidae" href="http://en.wikipedia.org/wiki/Gavialidae">Gavialidae</a>), or even the <a title="Crocodylomorpha" href="http://en.wikipedia.org/wiki/Crocodylomorpha">Crocodylomorpha</a> which includes prehistoric crocodile relatives and ancestors. Crocodiles are large aquatic <a title="Reptile" href="http://en.wikipedia.org/wiki/Reptile">reptiles</a> that live throughout the <a title="Tropics" href="http://en.wikipedia.org/wiki/Tropics">tropics</a> in <a title="Africa" href="http://en.wikipedia.org/wiki/Africa">Africa</a>, <a title="Asia" href="http://en.wikipedia.org/wiki/Asia">Asia</a>, the <a title="Americas" href="http://en.wikipedia.org/wiki/Americas">Americas</a> and <a title="Australia" href="http://en.wikipedia.org/wiki/Australia">Australia</a>. Crocodiles tend to congregate in freshwater habitats like <a title="River" href="http://en.wikipedia.org/wiki/River">rivers</a>, <a title="Lake" href="http://en.wikipedia.org/wiki/Lake">lakes</a>, <a title="Wetland" href="http://en.wikipedia.org/wiki/Wetland">wetlands</a> and sometimes in <a class="mw-redirect" title="Brackish" href="http://en.wikipedia.org/wiki/Brackish">brackish</a> water. They feed mostly on <a title="Vertebrate" href="http://en.wikipedia.org/wiki/Vertebrate">vertebrates</a> like <a title="Fish" href="http://en.wikipedia.org/wiki/Fish">fish</a>, <a title="Reptile" href="http://en.wikipedia.org/wiki/Reptile">reptiles</a>, and <a title="Mammal" href="http://en.wikipedia.org/wiki/Mammal">mammals</a>, sometimes on <a title="Invertebrate" href="http://en.wikipedia.org/wiki/Invertebrate">invertebrates</a> like <a class="mw-redirect" title="Mollusk" href="http://en.wikipedia.org/wiki/Mollusk">mollusks</a> and <a title="Crustacean" href="http://en.wikipedia.org/wiki/Crustacean">crustaceans</a>, depending on species. They are an ancient lineage, and are believed to have changed little since the time of the dinosaurs. They are believed to be 200 million years old whereas dinosaurs became extinct 65 million years ago; crocodiles survived great extinction events.<sup id="cite_ref-ausfauna_0-0" class="reference"><a href="http://en.wikipedia.org/wiki/Crocodile#cite_note-ausfauna-0"><span>[</span>1<span>]</span></a></sup></p>\n</div>', 1, NULL, NULL, '2009-08-06 17:54:16', '2009-08-09 07:17:42', 0, '7be87b1197f1d38b8b117c1fb8733f04c452665b', 0, 0, 0),
(69, 'more-food-waiter', 'more food waiter', '<p>something here</p>', 1, 'Some hot hot food nice n spicy', 'food, eating,spices', '2009-08-22 22:11:00', '2009-08-22 22:20:24', 1, 'ec5c8d7160967eb0f1b23bf8b1767dd1586f5ce8', 0, 1, 0),
(70, 'a-golden-post-here', 'a golden post here', '<p>so we are now using the new slugs we have a few missing glitches but things are show progress last x hours have been grueling</p>', 1, '', 'books, short', '2009-08-23 06:20:00', '2009-08-23 07:58:22', 0, '943180594347511f66ac34b2f7b4a41e7307c4db', 0, 0, 0),
(71, 'a-silver-post', 'A Silver Post', '<p>Silver not golden.&nbsp; Yet still bueatiful like some like peoms; i like code peots</p>', 1, '', 'silver, culture', '2009-08-23 06:34:00', '2009-08-23 06:41:39', 0, '00c31d2f0a7fd69226e9c9f217b375ca7dd7412c', 0, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `revisions`
--

DROP TABLE IF EXISTS `revisions`;
CREATE TABLE IF NOT EXISTS `revisions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `node_id` int(11) NOT NULL,
  `content` text COLLATE utf8_unicode_ci NOT NULL,
  `revision_number` int(11) NOT NULL,
  `created` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `type` (`type`,`node_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=31 ;

--
-- Dumping data for table `revisions`
--

INSERT INTO `revisions` (`id`, `type`, `node_id`, `content`, `revision_number`, `created`) VALUES
(1, 'page', 215, '{"Page":{"title":"Plugins","content":"<p>Its easto use cakephp plugins in wf and extremely rewarding to but can a shell task of an app call another shell task that resides in a plugin - for that matter can a plugins shell task call another plugins shell tasks?<\\/p>\\n<p>this is a sub <strong>page<\\/strong><\\/p>\\n<p>use jquery plguins easily t<\\/p>"}}', 1, '2009-08-22 22:09:35'),
(2, 'post', 69, '{"Post":{"title":"more food waiter"}}', 1, '2009-08-22 22:11:22'),
(3, 'post', 69, '{"Post":{"title":"more food waiter","content":"<p>something here<\\/p>"}}', 2, '2009-08-22 22:11:46'),
(4, 'post', 69, '{"Post":{"description_meta_tag":"Some hot hot food nice n spicy","keywords_meta_tag":"food, eating,spices"}}', 3, '2009-08-22 22:20:24'),
(5, 'page', 218, '{"Page":{"title":"Test Six","content":""}}', 1, '2009-08-23 05:52:09'),
(6, 'page', 219, '{"Page":{"title":"Test Six","content":""}}', 1, '2009-08-23 05:54:33'),
(7, 'page', 220, '{"Page":{"title":"Test Six","content":""}}', 1, '2009-08-23 05:55:02'),
(8, 'page', 221, '{"Page":{"title":"Test Six","content":""}}', 1, '2009-08-23 05:56:06'),
(9, 'page', 222, '{"Page":{"title":"Test Six","content":""}}', 1, '2009-08-23 05:57:14'),
(10, 'page', 222, '{"Page":{"title":"Test Six","content":"<p>test six with odd mce controls - the js condition to not editor on some actions is not working<\\/p>"}}', 2, '2009-08-23 05:58:24'),
(11, 'page', 222, '{"Page":{"title":"Test Six","content":"<p>test six with odd mce controls - the js condition to not editor on some actions is not working (without it I get extras)<\\/p>"}}', 3, '2009-08-23 06:00:45'),
(12, 'page', 222, '{"Page":{"title":"Contact","content":"<p>Contact Page Message here<\\/p>"}}', 4, '2009-08-23 06:16:24'),
(13, 'post', 70, '{"Post":{"title":"a golden post here"}}', 1, '2009-08-23 06:20:08'),
(14, 'post', 70, '{"Post":{"title":"a golden post here","content":"<p>so we are now using the new slugs we have a few missing glitches but things are show progress last x hours have been grueling<\\/p>"}}', 2, '2009-08-23 06:21:05'),
(15, 'post', 71, '{"Post":{"title":"A Silver Post"}}', 1, '2009-08-23 06:34:12'),
(16, 'post', 71, '{"Post":{"title":"A Silver Post","content":"<p>Silver not golden<\\/p>"}}', 2, '2009-08-23 06:34:36'),
(17, 'post', 71, '{"Post":{"description_meta_tag":"","keywords_meta_tag":"silver"}}', 3, '2009-08-23 06:38:16'),
(18, 'post', 71, '{"Post":{"title":"A Silver Post","content":"<p>Silver not golden.&nbsp; Yet still bueatiful<\\/p>"}}', 4, '2009-08-23 06:39:07'),
(19, 'post', 71, '{"Post":{"title":"A Silver Post","content":"<p>Silver not golden.&nbsp; Yet still bueatiful like some like peoms; i like code peots<\\/p>"}}', 5, '2009-08-23 06:40:00'),
(20, 'post', 71, '{"Post":{"description_meta_tag":"","keywords_meta_tag":"silver, culture"}}', 6, '2009-08-23 06:41:39'),
(21, 'page', 211, '{"Page":{"title":"API","content":"<h2>WildHelper<\\/h2>\\n<h3>menu($slug, $id = null)<\\/h3>\\n<p>bla bla<\\/p>\\n<p>&nbsp;<\\/p>\\n<p>this has various sidebars<\\/p>"}}', 1, '2009-08-23 07:09:25'),
(22, 'post', 70, '{"Post":{"description_meta_tag":"","keywords_meta_tag":""}}', 3, '2009-08-23 07:50:19'),
(23, 'post', 70, '{"Post":{"title":"a golden post here","content":"<p>so we are now using the new slugs we have a few missing glitches but things are show progress last x hours have been grueling<\\/p>"}}', 4, '2009-08-23 07:50:40'),
(24, 'post', 70, '{"Post":{"description_meta_tag":"","keywords_meta_tag":"books"}}', 5, '2009-08-23 07:52:08'),
(25, 'post', 70, '{"Post":{"description_meta_tag":"","keywords_meta_tag":"books, short"}}', 6, '2009-08-23 07:58:22'),
(26, 'page', 223, '{"Page":{"title":"short urls","content":""}}', 1, '2009-08-23 08:01:24'),
(27, 'page', 223, '{"Page":{"title":"short urls","content":"<p>foreinstance this page has a short url of<\\/p>\\n<p>&nbsp;<\\/p>\\n<p>and a <a href=\\"http:\\/\\/majic.wildflower.ss29\\/s\\/so\\">golden post<\\/a> too; noting tjat .htaccess can be set to use a distinct domain for shorts, also that rev canoical is set also<\\/p>"}}', 2, '2009-08-23 08:05:07'),
(28, 'page', 223, '{"Page":{"description_meta_tag":"","keywords_meta_tag":"short, feature"}}', 3, '2009-08-23 08:05:55'),
(29, 'page', 224, '{"Page":{"title":"Add-ons for Plugins","content":""}}', 1, '2009-08-25 03:01:22'),
(30, 'page', 224, '{"Page":{"title":"Add-ons for Plugins","content":"<p>extra add ons for plugins to make you marvel<\\/p>"}}', 2, '2009-08-25 03:01:54');

-- --------------------------------------------------------

--
-- Table structure for table `schema_info`
--

DROP TABLE IF EXISTS `schema_info`;
CREATE TABLE IF NOT EXISTS `schema_info` (
  `version` int(11) unsigned NOT NULL DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `schema_info`
--

INSERT INTO `schema_info` (`version`) VALUES
(26);

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
CREATE TABLE IF NOT EXISTS `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `value` text COLLATE utf8_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `type` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `label` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `order` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=14 ;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `name`, `value`, `description`, `type`, `label`, `order`) VALUES
(1, 'site_name', 'Wildflower', '', 'text', NULL, 1),
(2, 'description', 'A CakePHP CMS', '', 'textbox', NULL, 2),
(3, 'home_page_id', '210', 'Page that will be shown when visiting the site root.', 'select', 'Home page', 3),
(4, 'contact_email', 'you@localhost', 'You`ll receive notifications when somebody posts a comment or uses the contact form on this email address.', 'text', 'Contact email address', 4),
(5, 'google_analytics_code', '', '', 'textbox', NULL, 10),
(6, 'wordpress_api_key', '', '', 'text', NULL, 9),
(7, 'smtp_server', '', '', 'text', NULL, 6),
(8, 'smtp_username', '', '', 'text', NULL, 7),
(9, 'smtp_password', '', '', 'text', NULL, 8),
(11, 'email_delivery', 'mail', NULL, 'select', NULL, 5),
(12, 'cache', 'off', NULL, 'select', 'Page and post caching', 11),
(13, 'approve_comments', '1', '', 'checkbox', 'Approve each comment before publishing it', 12);

-- --------------------------------------------------------

--
-- Table structure for table `shorts`
--

DROP TABLE IF EXISTS `shorts`;
CREATE TABLE IF NOT EXISTS `shorts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `slug` char(4) COLLATE utf8_unicode_ci NOT NULL,
  `url` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `created` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `url` (`url`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=7 ;

--
-- Dumping data for table `shorts`
--

INSERT INTO `shorts` (`id`, `slug`, `url`, `created`) VALUES
(5, 'so', '/p/a-golden-post-here', '2009-08-23 07:57:42'),
(2, 'sas', '/p/sharks-1', '2009-08-09 23:09:19'),
(3, 'fsl', '/features/plugins', '2009-08-09 23:12:44'),
(6, '-s', '/features/short-urls', '2009-08-23 08:06:30');

-- --------------------------------------------------------

--
-- Table structure for table `sidebars`
--

DROP TABLE IF EXISTS `sidebars`;
CREATE TABLE IF NOT EXISTS `sidebars` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `content` text COLLATE utf8_unicode_ci,
  `created` datetime DEFAULT NULL,
  `updated` datetime DEFAULT NULL,
  `on_posts` int(11) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=6 ;

--
-- Dumping data for table `sidebars`
--

INSERT INTO `sidebars` (`id`, `title`, `content`, `created`, `updated`, `on_posts`) VALUES
(1, 'Test sidebar', '<p>Lorem ipsum.</p>', '2009-05-17 07:03:29', '2009-08-07 01:16:25', 0),
(2, 'contact-frm', '<p><img id="admin_widget_contact_form" class="admin_widget admin_widget_id_1" src="/wildflower/widgets/admin_widget_contact_form.png" alt="" /></p>', '2009-08-22 04:53:34', '2009-08-23 06:16:55', 0),
(3, 'posts-main-sb', '<p>sidebar</p>', '2009-08-23 06:18:11', '2009-08-23 06:18:25', 1),
(4, 'multiplacedsb', '<p>sidebar items in loads of places</p>', '2009-08-23 06:19:10', '2009-08-23 06:19:23', 1),
(5, 'apisb', '<ul>\r\n<li>helpers</li>\r\n<li>componants</li>\r\n<li>extras</li>\r\n<li>shiiite</li>\r\n</ul>', '2009-08-23 07:11:23', '2009-08-23 07:27:17', 1);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
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
  PRIMARY KEY (`id`),
  KEY `cookie` (`cookie_token`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=94 ;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `login`, `password`, `email`, `name`, `cookie_token`, `created`, `updated`, `last_login`) VALUES
(1, 'admin', 'e569c558b6119c2948d97ff3bffd87423f75c2b1', 'alias@example.com', 'Mr Admin', '', '2008-07-11 14:24:43', '2009-08-25 03:47:48', '0000-00-00 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `widgets`
--

DROP TABLE IF EXISTS `widgets`;
CREATE TABLE IF NOT EXISTS `widgets` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `config` text COLLATE utf8_unicode_ci,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=3 ;

--
-- Dumping data for table `widgets`
--

INSERT INTO `widgets` (`id`, `config`) VALUES
(1, '{"Widget":""}'),
(2, '{"Widget":""}');
