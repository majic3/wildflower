
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