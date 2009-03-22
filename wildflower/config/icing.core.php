<?php

// icing config 0.6
Configure::write(array('Icing' => array(
	'version' => '0.6.9',
	'prefix' => '',
    'dashboardFeeds' => array(	
		array(
        'url' => 'wf.klevo.sk/posts/feed',
        'name' => 'Wildflower',
		),
		array(
        'name' => 'CakePHP',
        'url' => 'bakery.cakephp.org/articles/rss'
		),
		array(
        'name' => 'jQuery',
        'url' => 'jquery.com/blog/feed/'
		),
		array(
        'name' => 'Mark Grabanksi',
        'url' => 'marcgrabanski.com/feed'
		),
		array(
        'name' => 'Kevin Vanzonneveld',
        'url' => 'feeds.feedburner.com/kvz-bookmarks'
		), 
		array(
        'name' => 'cakephp.nu',
        'url' => 'feeds.feedburner.com/CakephpnuBlog?format=xml'
		), 	 
		array(
        'name' => 'Jonathon Snook',
        'url' => 'snook.ca/jonathan/index.rdf'
		)
	),
    'open_id' => array(
		'adminConfig' => array(
			'email' => 'info@majic3.com'
		),
		'pubSettings' => array(
			'useOnComments' => false
		)
	),
    'gravatar' => array(
		'pubSettings' => array(
			'useOnComments' => false
		)
	),
    'gfeed' => array(
		'api' => 'ABQIAAAATJDz3SHaGWyq5qF_V0_zqBRbCevG-mEjTHRSQMj5mWIVV3lQuxRxbis6VpyK9WsE5GSVOTGHPXa83w'
	),				//majic3.com ABQIAAAATJDz3SHaGWyq5qF_V0_zqBQfAeZtjHzM_Fkco9NcQuT7awigGxQd085qR01zdjuwccF1dwXAsmZetA
    'webthumbs' => array(
		'thumb_url' => 'http://webthumb.bluga.net/easythumb.php',
		'user_id' => '4007',
		'api_key' => 'f7ca5c1ed53b55978471d51c7f31acea', 
		'default_size' => 'medium2', 
		'default_cache' => '-1'
    )
)));

// flickr - 0.1a
Configure::write(array('Flickr' => array(
	'userID' => 'majic 3',
	'secret' => 'd08eb7784a1af72a',
	'api_key' => 'da19a5f83838ffd5a3850fe3e776cfe1',
	'cache' => CACHE . 'flickr',
)));

// slideshowpro director - 0.1a
Configure::write(array('Director' => array(
	'api_key' => 'local-0c20d92e349979b46da03566120892ae',
	'path' => 'www.danceordie.co.uk/photos2', 
	'cache' => APP . 'vendors' . DS . 'Director' . DS  . 'cache',
	'settings' => array(
		'thumb' => array(
			'w' => 150,
			'h' => 150,
			's' => 85,
			'c' => true
		),
		'preview' => array(
			'w' => 280,
			'h' => 120,
			's' => 65,
			'c' => false
		),
		'large' => array(
			'w' => 600,
			'h' => 400,
			's' => 85,
			'c' => false
		)
	)
)));