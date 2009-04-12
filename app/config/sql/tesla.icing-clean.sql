-- phpMyAdmin SQL Dump
-- version 3.1.2
-- http://www.phpmyadmin.net
--
-- Host: localhost:3306
-- Generation Time: Apr 12, 2009 at 08:09 PM
-- Server version: 5.0.51
-- PHP Version: 5.2.6

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";

--
-- Database: `icing_tesla`
--

-- --------------------------------------------------------

--
-- Table structure for table `schema_info`
--

CREATE TABLE IF NOT EXISTS `schema_info` (
  `version` int(11) unsigned NOT NULL default '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tags`
--

CREATE TABLE IF NOT EXISTS `tags` (
  `id` int(11) NOT NULL auto_increment,
  `name` varchar(255) collate utf8_unicode_ci NOT NULL,
  PRIMARY KEY  (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `tags_uploads`
--

CREATE TABLE IF NOT EXISTS `tags_uploads` (
  `upload_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL,
  KEY `tag_id` (`tag_id`),
  KEY `upload_id` (`upload_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wild_assets`
--

CREATE TABLE IF NOT EXISTS `wild_assets` (
  `id` int(11) NOT NULL auto_increment,
  `name` varchar(255) collate utf8_unicode_ci NOT NULL,
  `title` varchar(255) collate utf8_unicode_ci NOT NULL,
  `mime` varchar(20) collate utf8_unicode_ci NOT NULL,
  `created` datetime NOT NULL,
  `updated` datetime NOT NULL,
  PRIMARY KEY  (`id`),
  KEY `mime` (`mime`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=26 ;

-- --------------------------------------------------------

--
-- Table structure for table `wild_categories`
--

CREATE TABLE IF NOT EXISTS `wild_categories` (
  `id` int(11) NOT NULL auto_increment,
  `parent_id` int(11) default NULL,
  `lft` int(11) default NULL,
  `rght` int(11) default NULL,
  `slug` varchar(255) collate utf8_unicode_ci NOT NULL,
  `title` varchar(255) collate utf8_unicode_ci NOT NULL,
  `description` varchar(255) collate utf8_unicode_ci default NULL,
  PRIMARY KEY  (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `parent_id` (`parent_id`),
  KEY `tree_left` (`lft`),
  KEY `tree_right` (`rght`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=49 ;

-- --------------------------------------------------------

--
-- Table structure for table `wild_categories_wild_links`
--

CREATE TABLE IF NOT EXISTS `wild_categories_wild_links` (
  `category_id` int(11) NOT NULL,
  `link_id` int(11) NOT NULL,
  KEY `category_id` (`category_id`,`link_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wild_categories_wild_posts`
--

CREATE TABLE IF NOT EXISTS `wild_categories_wild_posts` (
  `wild_category_id` int(11) default NULL,
  `wild_post_id` int(11) default NULL,
  KEY `category_id` (`wild_category_id`,`wild_post_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wild_comments`
--

CREATE TABLE IF NOT EXISTS `wild_comments` (
  `id` int(11) NOT NULL auto_increment,
  `wild_post_id` int(11) default NULL,
  `name` varchar(255) collate utf8_unicode_ci NOT NULL,
  `email` char(80) collate utf8_unicode_ci NOT NULL,
  `url` char(80) collate utf8_unicode_ci default NULL,
  `content` text collate utf8_unicode_ci NOT NULL,
  `spam` tinyint(1) NOT NULL default '0',
  `created` datetime NOT NULL,
  `updated` datetime NOT NULL,
  `approved` int(1) NOT NULL default '0',
  PRIMARY KEY  (`id`),
  KEY `post_id` (`wild_post_id`),
  KEY `spam` (`spam`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=154 ;

-- --------------------------------------------------------

--
-- Table structure for table `wild_links`
--

CREATE TABLE IF NOT EXISTS `wild_links` (
  `id` int(11) NOT NULL auto_increment,
  `slug` char(125) collate utf8_unicode_ci NOT NULL,
  `name` varchar(100) collate utf8_unicode_ci NOT NULL,
  `url` varchar(255) collate utf8_unicode_ci NOT NULL,
  `image` char(255) collate utf8_unicode_ci default NULL,
  `created` datetime NOT NULL,
  `updated` datetime NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Stores all contact form communication' AUTO_INCREMENT=6 ;

-- --------------------------------------------------------

--
-- Table structure for table `wild_messages`
--

CREATE TABLE IF NOT EXISTS `wild_messages` (
  `id` int(11) NOT NULL auto_increment,
  `name` varchar(100) collate utf8_unicode_ci NOT NULL,
  `email` varchar(100) collate utf8_unicode_ci NOT NULL,
  `phone` varchar(100) collate utf8_unicode_ci NOT NULL,
  `content` text collate utf8_unicode_ci,
  `created` datetime NOT NULL,
  `updated` datetime NOT NULL,
  `subject` varchar(255) collate utf8_unicode_ci default NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Stores all contact form communication' AUTO_INCREMENT=5 ;

-- --------------------------------------------------------

--
-- Table structure for table `wild_pages`
--

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
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=207 ;

-- --------------------------------------------------------

--
-- Table structure for table `wild_posts`
--

CREATE TABLE IF NOT EXISTS `wild_posts` (
  `id` int(11) NOT NULL auto_increment,
  `slug` varchar(255) collate utf8_unicode_ci NOT NULL,
  `title` varchar(255) collate utf8_unicode_ci NOT NULL,
  `content` text collate utf8_unicode_ci,
  `wild_user_id` int(11) default NULL,
  `description_meta_tag` text collate utf8_unicode_ci,
  `keywords_meta_tag` text collate utf8_unicode_ci,
  `created` datetime NOT NULL,
  `updated` datetime NOT NULL,
  `draft` int(1) NOT NULL default '0',
  `uuid` varchar(255) collate utf8_unicode_ci NOT NULL,
  `allowComments` int(1) NOT NULL default '0',
  `wild_comment_count` int(11) default '0',
  PRIMARY KEY  (`id`),
  UNIQUE KEY `slug` (`slug`),
  FULLTEXT KEY `content` (`content`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=57 ;

-- --------------------------------------------------------

--
-- Table structure for table `wild_profiles`
--

CREATE TABLE IF NOT EXISTS `wild_profiles` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `user_id` int(10) NOT NULL default '0',
  `avatar` varchar(45) default NULL,
  `data` text NOT NULL,
  `url` varchar(255) default NULL,
  `created` datetime NOT NULL,
  `updated` datetime NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=2 ;

-- --------------------------------------------------------

--
-- Table structure for table `wild_revisions`
--

CREATE TABLE IF NOT EXISTS `wild_revisions` (
  `id` int(11) NOT NULL auto_increment,
  `type` varchar(255) collate utf8_unicode_ci NOT NULL,
  `node_id` int(11) NOT NULL,
  `content` text collate utf8_unicode_ci NOT NULL,
  `revision_number` int(11) NOT NULL,
  `created` datetime NOT NULL,
  PRIMARY KEY  (`id`),
  KEY `type` (`type`,`node_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=410 ;

-- --------------------------------------------------------

--
-- Table structure for table `wild_settings`
--

CREATE TABLE IF NOT EXISTS `wild_settings` (
  `id` int(11) NOT NULL auto_increment,
  `name` varchar(255) collate utf8_unicode_ci NOT NULL,
  `value` text collate utf8_unicode_ci NOT NULL,
  `description` varchar(255) collate utf8_unicode_ci default NULL,
  `type` varchar(255) collate utf8_unicode_ci default NULL,
  `label` varchar(255) collate utf8_unicode_ci default NULL,
  `order` int(11) NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=15 ;

--
-- Dumping data for table `wild_settings`
--

INSERT INTO `wild_settings` (`id`, `name`, `value`, `description`, `type`, `label`, `order`) VALUES
(1, 'site_name', 'Tesla : Icing : Wildflower', '', 'text', NULL, 1),
(2, 'description', 'A CakePHP CMS', '', 'textbox', NULL, 2),
(3, 'home_page_id', '185', 'Page that will be shown when visiting the site root.', 'select', 'Home page', 3),
(4, 'contact_email', 'alias@example.com', 'You`ll receive notifications when somebody posts a comment or uses the contact form on this email address.', 'text', 'Contact email address', 4),
(5, 'google_analytics_code', '', '', 'textbox', NULL, 10),
(6, 'wordpress_api_key', '', '', 'text', NULL, 9),
(7, 'smtp_server', '', '', 'text', NULL, 6),
(8, 'smtp_username', '', '', 'text', NULL, 7),
(9, 'smtp_password', '', '', 'text', NULL, 8),
(11, 'email_delivery', 'mail', NULL, 'select', NULL, 5),
(12, 'cache', 'off', NULL, 'select', 'Page and post caching', 11),
(14, 'public_theme', '', 'Set theme for public site', 'text', 'Public Theme Setting', 14);


-- --------------------------------------------------------

--
-- Table structure for table `wild_users`
--

CREATE TABLE IF NOT EXISTS `wild_users` (
  `id` int(11) NOT NULL auto_increment,
  `login` varchar(255) collate utf8_unicode_ci NOT NULL,
  `password` char(40) collate utf8_unicode_ci NOT NULL,
  `email` varchar(255) collate utf8_unicode_ci NOT NULL,
  `name` varchar(255) collate utf8_unicode_ci default NULL,
  `cookie_token` varchar(255) collate utf8_unicode_ci default NULL,
  `created` datetime NOT NULL,
  `updated` datetime NOT NULL,
  PRIMARY KEY  (`id`),
  KEY `cookie` (`cookie_token`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=16 ;

-- --------------------------------------------------------

--
-- Table structure for table `wild_widgets`
--

CREATE TABLE IF NOT EXISTS `wild_widgets` (
  `id` int(11) unsigned NOT NULL auto_increment,
  `config` text collate utf8_unicode_ci,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=37 ;
