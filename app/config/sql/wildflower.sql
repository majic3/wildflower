-- MySQL dump 10.13  Distrib 5.1.42, for apple-darwin10.2.0 (i386)
--
-- Host: localhost    Database: wildflower
-- ------------------------------------------------------
-- Server version	5.1.42-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
/*	needs updated	*/

--
-- Table structure for table `assets`
--

DROP TABLE IF EXISTS `assets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `assets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `mime` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `created` datetime NOT NULL,
  `updated` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `mime` (`mime`)
) ENGINE=MyISAM AUTO_INCREMENT=15 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assets`
--

LOCK TABLES `assets` WRITE;
/*!40000 ALTER TABLE `assets` DISABLE KEYS */;
/*!40000 ALTER TABLE `assets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categories` (
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
) ENGINE=MyISAM AUTO_INCREMENT=61 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (58,57,8,9,'sci-fi','Sci-fi',NULL),(59,57,10,11,'love-poetry','Love poetry',NULL),(54,53,2,3,'action','Action',NULL),(56,NULL,5,6,'cooking','Cooking',NULL),(57,NULL,7,12,'books','Books',NULL),(53,NULL,1,4,'movies','Movies',NULL);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories_posts`
--

DROP TABLE IF EXISTS `categories_posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categories_posts` (
  `category_id` int(11) DEFAULT NULL,
  `post_id` int(11) DEFAULT NULL,
  KEY `category_id` (`category_id`,`post_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories_posts`
--

LOCK TABLES `categories_posts` WRITE;
/*!40000 ALTER TABLE `categories_posts` DISABLE KEYS */;
INSERT INTO `categories_posts` VALUES (56,60),(57,56),(57,60),(59,49),(59,52);
/*!40000 ALTER TABLE `categories_posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comments` (
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
) ENGINE=MyISAM AUTO_INCREMENT=17 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu_items`
--

DROP TABLE IF EXISTS `menu_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `menu_items` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `menu_id` int(11) DEFAULT NULL,
  `label` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `url` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `order` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_items`
--

LOCK TABLES `menu_items` WRITE;
/*!40000 ALTER TABLE `menu_items` DISABLE KEYS */;
INSERT INTO `menu_items` VALUES (1,1,'Download','/',0),(2,1,'News','/blog',1),(3,1,'Documentation','/documentation',2),(4,1,'API','/api',3),(5,1,'Source Code','http://github.com/klevo/wildflower/tree/master',4),(6,1,'Donate','/donate',5),(7,1,'Contact Us','/contact',6);
/*!40000 ALTER TABLE `menu_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menus`
--

DROP TABLE IF EXISTS `menus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `menus` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `slug` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menus`
--

LOCK TABLES `menus` WRITE;
/*!40000 ALTER TABLE `menus` DISABLE KEYS */;
INSERT INTO `menus` VALUES (1,'Main menu','Main_menu');
/*!40000 ALTER TABLE `menus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `messages` (
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
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Stores all contact form communication';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `modules`
--

DROP TABLE IF EXISTS `modules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `modules` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `page_id` int(11) NOT NULL,
  `content` text COLLATE utf8_unicode_ci,
  `type` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `modules`
--

LOCK TABLES `modules` WRITE;
/*!40000 ALTER TABLE `modules` DISABLE KEYS */;
INSERT INTO `modules` VALUES (1,210,NULL,'text'),(2,210,NULL,'text'),(3,210,NULL,'text');
/*!40000 ALTER TABLE `modules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pages`
--

DROP TABLE IF EXISTS `pages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pages` (
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
) ENGINE=MyISAM AUTO_INCREMENT=215 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pages`
--

LOCK TABLES `pages` WRITE;
/*!40000 ALTER TABLE `pages` DISABLE KEYS */;
INSERT INTO `pages` VALUES (211,NULL,3,4,0,'api','/api','API','<h2>WildHelper</h2>\n<h3>menu($slug, $id = null)</h3>\n<p>bla bla</p>',NULL,NULL,0,'2009-06-28 19:14:16','2009-06-28 19:16:08',NULL,1,NULL),(212,NULL,5,6,0,'documentation','/documentation','Documentation','<p>No docs here. Buhaha.</p>',NULL,NULL,0,'2009-06-29 19:07:22','2010-02-04 13:54:01',NULL,1,NULL),(210,NULL,1,2,0,'home','/home','Wildflower is a CakePHP content management system','<p>The aim is to remove all unnecessary features of a modern CMS and provide the most effective and simple way to manage a website.</p>\n<p>The foundation of a rapid development framework CakePHP allows developers to build any features specific to their project quickly and effectively.</p>',NULL,NULL,0,'2009-06-28 18:15:30','2009-06-28 18:52:54',NULL,1,NULL),(213,NULL,7,8,0,'contact','/contact','Contact','',NULL,NULL,0,'2009-12-18 15:13:23','2009-12-18 15:13:32',NULL,1,NULL),(214,NULL,9,10,0,'donate','/donate','Donate','<p>Donate at <a href=\"http://pledgie.com/campaigns/6043\">Pledgie</a>.</p>',NULL,NULL,0,'2010-02-04 13:54:36','2010-02-04 13:55:05',NULL,1,NULL);
/*!40000 ALTER TABLE `pages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pages_sidebars`
--

DROP TABLE IF EXISTS `pages_sidebars`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pages_sidebars` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `page_id` int(11) DEFAULT NULL,
  `sidebar_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pages_sidebars`
--

LOCK TABLES `pages_sidebars` WRITE;
/*!40000 ALTER TABLE `pages_sidebars` DISABLE KEYS */;
/*!40000 ALTER TABLE `pages_sidebars` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `posts` (
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
  `comment_count` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  FULLTEXT KEY `content` (`content`)
) ENGINE=MyISAM AUTO_INCREMENT=64 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES (60,'a-test-posts','A test posts','<p>dasdasd</p>',1,NULL,NULL,'2009-06-29 18:44:28','2010-02-04 13:52:56',0,0,'755abcb0855fe16cc54f270e59a4efd6091783a9',0);
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `revisions`
--

DROP TABLE IF EXISTS `revisions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `revisions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `node_id` int(11) NOT NULL,
  `content` text COLLATE utf8_unicode_ci NOT NULL,
  `revision_number` int(11) NOT NULL,
  `created` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `type` (`type`,`node_id`)
) ENGINE=MyISAM AUTO_INCREMENT=451 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `revisions`
--

LOCK TABLES `revisions` WRITE;
/*!40000 ALTER TABLE `revisions` DISABLE KEYS */;

/*!40000 ALTER TABLE `revisions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schema_info`
--

DROP TABLE IF EXISTS `schema_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `schema_info` (
  `version` int(11) unsigned NOT NULL DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schema_info`
--

LOCK TABLES `schema_info` WRITE;
/*!40000 ALTER TABLE `schema_info` DISABLE KEYS */;
INSERT INTO `schema_info` VALUES (28);
/*!40000 ALTER TABLE `schema_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `value` text COLLATE utf8_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `type` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `label` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `order` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=17 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES (1,'site_name','Wildflower','','text',NULL,1),(2,'description','A CakePHP CMS','','textbox',NULL,2),(3,'keywords','CakePHP, CMS, WildFlower','','textbox',NULL,3),(4,'home_page_id','210','Page that will be shown when visiting the site root.','select','Home page',4),(5,'contact_email','you@localhost','You`ll receive notifications when somebody posts a comment or uses the contact form on this email address.','text','Contact email address',5),(6,'email_delivery','mail',NULL,'select',NULL,6),(7,'smtp_server','','','text',NULL,7),(8,'smtp_username','','','text',NULL,8),(9,'smtp_password','','','text',NULL,9),(10,'wordpress_api_key','','','text',NULL,10),(11,'google_analytics_code','','','textbox',NULL,11),(12,'cache','off',NULL,'select','Page and post caching',12),(13,'approve_comments','1','','checkbox','Approve each comment before publishing it',13),(14,'credits','Powered by <a href=\"http://wf.klevo.sk/\">Wildflower</a>. Wildflower Logo designed by <a href=\"http://www.olivertreend.com/\">Oliver Treend</a>','Site credits','textbox',NULL,14),(15,'homepage_credits','1','','checkbox','Credits on homepage only',15),(16,'theme','1','','select','Theme',16);
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sidebars`
--

DROP TABLE IF EXISTS `sidebars`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sidebars` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `content` text COLLATE utf8_unicode_ci,
  `created` datetime DEFAULT NULL,
  `updated` datetime DEFAULT NULL,
  `region` varchar(35) COLLATE utf8_unicode_ci DEFAULT NULL,
  `on_posts` int(11) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sidebars`
--

LOCK TABLES `sidebars` WRITE;
/*!40000 ALTER TABLE `sidebars` DISABLE KEYS */;
INSERT INTO `sidebars` VALUES (1,'Test sidebar','<p>Lorem ipsum.</p>','2009-05-17 07:03:29','2009-05-17 07:03:29', NULL,0);
/*!40000 ALTER TABLE `sidebars` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
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
) ENGINE=MyISAM AUTO_INCREMENT=111 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','e569c558b6119c2948d97ff3bffd87423f75c2b1','admin@localhost.sk','Mr Admin','b86da1d23af76ed068fc49f1291c3a0a93cece69','2008-07-11 14:24:43','2010-02-04 13:52:32','0000-00-00 00:00:00');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `widgets`
--

DROP TABLE IF EXISTS `widgets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `widgets` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `config` text COLLATE utf8_unicode_ci,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=32 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `widgets`
--

LOCK TABLES `widgets` WRITE;
/*!40000 ALTER TABLE `widgets` DISABLE KEYS */;
INSERT INTO `widgets` VALUES (3,'{\"WildWidget\":\"\"}'),(4,'{\"WildWidget\":\"\"}'),(5,'{\"WildWidget\":\"\"}'),(6,'{\"WildWidget\":\"\"}'),(7,'{\"WildWidget\":\"\"}'),(8,'{\"WildWidget\":\"\"}'),(9,'{\"WildWidget\":\"\"}'),(10,'{\"WildWidget\":\"\"}'),(11,'{\"WildWidget\":\"\"}'),(12,'{\"WildWidget\":{\"0\":{\"label\":\"Passion 2\",\"url\":\"\\/passions\"},\"id\":\"12\"}}'),(13,'{\"WildWidget\":{\"0\":{\"item\":\"passion\"},\"id\":\"12\"}}'),(14,'{\"WildWidget\":{\"0\":{\"label\":\"New slider\",\"url\":\"\\/hoho\"},\"id\":\"14\"}}'),(15,'{\"WildWidget\":{\"0\":{\"label\":\"Passion\",\"url\":\"\\/passion\"},\"id\":\"15\"}}'),(16,'{\"WildWidget\":\"\"}'),(17,'{\"WildWidget\":\"\"}'),(18,'{\"WildWidget\":\"\"}'),(19,'{\"WildWidget\":\"\"}'),(20,'{\"WildWidget\":\"\"}'),(21,'{\"WildWidget\":\"\"}'),(22,'{\"WildWidget\":{\"items\":[{\"label\":\"Really ds\",\"url\":\"nice 1 sd\"},{\"label\":\"radio\",\"url\":\"spirit\"},{\"label\":\"Looks like\",\"url\":\"this-workds\"},{\"label\":\"cell4\",\"url\":\"Lol\"},{\"label\":\"Another cell\",\"url\":\"sddsd\"}],\"id\":\"22\"}}'),(23,'{\"WildWidget\":\"\"}'),(24,'{\"WildWidget\":\"\"}'),(25,'{\"WildWidget\":{\"items\":[{\"label\":\"No.2\",\"url\":\"\\/\"},{\"label\":\"No.3\",\"url\":\"\\/model-tweaks\"}],\"id\":\"25\"}}'),(26,'{\"WildWidget\":{\"items\":[{\"label\":\"ola\",\"url\":\"ola\"}],\"id\":\"26\"}}'),(27,'{\"WildWidget\":\"\"}'),(28,'{\"WildWidget\":\"\"}'),(29,'{\"WildWidget\":{\"items\":[{\"label\":\"John\",\"url\":\"john\"},{\"label\":\"Mark\",\"url\":\"mark\"},{\"label\":\"hh\",\"url\":\"\"}],\"randomize\":\"0\",\"id\":\"29\"}}'),(30,'{\"WildWidget\":\"\"}'),(31,'{\"WildWidget\":\"\"}');
/*!40000 ALTER TABLE `widgets` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2010-02-04 13:56:31
