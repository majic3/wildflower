<?php
class SitemapsController extends AppController {
	var $helpers = array('Time', 'Xml', 'Javascript', 'Navigation');
	var $components = array('RequestHandler');
	var $uses = array();
	var $array_dynamic = array();
	var $array_static = array();
	var $sitemap_url = '/sitemap.xml';
	var $yahoo_key = 'insert your yahoo api key here';

	function beforeFilter() {
		parent::beforeFilter();
		if (Configure::read('Wildflower.htmlCache') and $this->params['action'] == 'view') {
			$this->helpers[] = 'HtmlCache';
		}
	}

	function beforeRender() {
		parent::beforeRender();
		$this->set('isPage', true);
		$this->params['Wildflower']['view']['isPage'] = true;
	}

	/* 
	 * Our sitemap 
	 */
	function index(){
		$this->bdyClass = 'sitemap';
		   //Configure::write('debug', 0);        
		$this->__get_data();
		$this->set('dynamics', $this->array_dynamic);
		$this->set('statics', $this->array_static);        
		if ($this->RequestHandler->accepts('html')) {
			$this->RequestHandler->respondAs('html');
		} elseif ($this->RequestHandler->accepts('xml')) {
			$this->RequestHandler->respondAs('xml');
		}
	}

	/* 
	 * Action for send sitemaps to search engines
	 */
	function admin_index() {
		// This action must be only for admins
	}

	/* 
	 * Action for send sitemaps to search engines
	 */
	function admin_send() {
		// This action must be only for admins
	}

	/* 
	 * This make a simple robot.txt file use it if you don't have your own
	 */
	function robots() {
		Configure::write('debug', 0);
		$expire = 25920000;
		$this->RequestHandler->respondAs('txt');
		header('Date: ' . date("D, j M Y G:i:s ", time()) . ' GMT');
		header('Expires: ' . gmdate("D, d M Y H:i:s", time() + $expire) . ' GMT');
		header('Content-Type: text/plain');
		header('Cache-Control: max-age='.$expire.', s-maxage='.$expire.', must-revalidate, proxy-revalidate');
		header('Pragma: nocache');
		$rootPagesArr = ClassRegistry::init('Page')->findAllRoot();
		$rootPages = '';
		
		if($rootPagesArr)    {
				foreach($rootPagesArr as $Page)       {
						$rootPages .= "Allow: " . $Page['Page']['url'] . "\n";
				}
		} else {
				$rootPages = "Allow: /";
		}
		
		echo 'User-Agent: *'."\n$rootPages".'Sitemap: ' . FULL_BASE_URL . $this->sitemap_url;
		//echo json_encode($rootPagesArr);
		exit();
	}

	/* 
	 * Here must be all our public controllers and actions
	 */
	function __get_data() {

		// get all gen units from Wildflower Core
		$genUnits = Configure::read('Wildflower.sitemapData.units');
		$pubUrl = Configure::read('Wildflower.puburl');

	   // debug($genUnits);die();
		foreach($genUnits as $item => $unit)   {
	   //debug($unit);die();
		
			switch($unit)    {
				case 'posts':
					$Unit = ucfirst(Inflector::singularize($unit));
					// echo ($Unit);
					$blogName = Configure::read('Wildflower.blogName');
					$blogIndex = Configure::read('Wildflower.blogIndex');
					$postsParent = Configure::read('Wildflower.postsParent');
					$postParent = Configure::read('Wildflower.postParent');
					ClassRegistry::init($Unit)->recursive = false;
					$this->__add_dynamic_section(
										 $Unit, 
										 ClassRegistry::init($Unit)->find('all', array(
												'conditions' => array(
													'draft' => 0
												 ), 
												 'fields' => array(
													'slug', 'updated', 'title'
												)
											)
										 ), 
										 array(
												'displaytitle' => $blogName,
												'controllertitle' => false,
												'fields' => array('id' => 'slug'),
												'changefreq' => 'daily',
												'pr' => '1.0', 
												'url' => array('controller' => 'posts', 'action' => 'view'),
												'parentUrl' => $pubUrl . '/' . $blogIndex, 
												'childUrl' => $pubUrl . '/' . $postsParent . '/%SLUG%' 
											   )
										 );
				break;
				case 'categories':
				break;
				default: // Pages
					$Unit = ucfirst(Inflector::singularize($unit));
					$defaults = Configure::read('Wildflower.sitemapData.defaults.Page');
					
					ClassRegistry::init($Unit)->recursive = false;
					
					$AllPages = ClassRegistry::init($Unit)->find('all', array('conditions' => array('draft' => 0), 'order' => 'lft ASC', 'fields' => array('slug', 'url', 'updated', 'title', 'custom_fields')));
					//debug($AllPages);
										
					foreach($AllPages as $page => $pdata)   {
					
						if($pdata['Page']['url'] == '/') continue;
					
						$settings = am($defaults, array(
							'changefreq' => 'never',
							'pr' => '0.4',
							'url' => $pubUrl . $pdata['Page']['url']
						));
						
						$pr = Array();
						$cfparams = json_decode($pdata['Page']['custom_fields'], true);
						if($cfparams)    {
								foreach($cfparams as $k => $v)  {
									// echo ((strpos($v['name'], "seo_") !== false) ? '<br />yes' . $v['name'] : '<br />no' . $v['name']);
									if (strpos($v['name'], "seo_") !== false)        {
										$settings[str_replace('seo_', '', $v['name'])] = $v['value'];
										//  echo $v['name'];
									}
								}
						}
						
						$this->__add_static_section(
											 $pdata['Page']['title'], 
											 array('controller' => 'pages', 'action' => 'view'), 
												$settings
										);
					}
				break;
			}
		}
		
		$this->__add_static_section(
							 'Search', 
							 array('controller' => 'dashboards', 'action' => 'search'), 
						 array(
								'displaytitle' => 'Search',
								'controllertitle' => false,
								'changefreq' => 'never',
								'pr' => '0.2', 
								'url' => array('controller' => 'dashboards', 'action' => 'search'),
							   )
						);

			//debug($this->array_static);die();

	}

	/* 
	 * Add a "static" section
	 */
	function __add_static_section($title = null, $url = null, $options = null) {
		if(is_null($title) || empty($title) || is_null($url) || empty($url) ) {
			return false;
		}
		$defaultoptions = array(
								'pr' => '0.5', // Valid values range from 0.0 to 1.0
								'changefreq' => 'monthly',  // Possible values: always, hourly, daily, weekly, monthly, yearly, never
							);
		$options = array_merge($defaultoptions, $options);        
		$this->array_static[] = array(
									 'title' => $title,
									 'url' => $url,
									 'options' => $options
									 );        
	}


	/* 
	 * Add a section based on data from our database
	 */
	function __add_dynamic_section($model = null, $data = null, $options = null){
		if(is_null($model) || empty($model) || is_null($data) || empty($data) ) {
			return false;
		}        
		$defaultoptions = array(
									'fields' => array(
														'id' => 'id', 
														'date' => 'updated',
														'title' => 'title'
														),
									'controllertitle' => 'not set',
									'pr' => '0.5', // Valid values range from 0.0 to 1.0
									'changefreq' => 'monthly',  // Possible values: always, hourly, daily, weekly, monthly, yearly, never
									'url' => array(
												   'controller' => false, 
												   'action' => false, 
												   'index' => 'index'
												   )
								);
		$options = array_merge($defaultoptions, $options);
		$options['fields'] = array_merge($defaultoptions['fields'], $options['fields']);
		$options['url'] = array_merge($defaultoptions['url'], $options['url']);        
		if($options['fields']['date'] == false) {
			$options['fields']['date'] = time();
		}        
		$this->array_dynamic[] = array(
									 'model' => $model,
									 'options' => $options,
									 'data' => $data
									 );
	}

	/* 
	 * This make a GET petition to search engine url
	 */    
	function __ping_site($url = null, $params = null) {
		if(is_null($url) || empty($url) || is_null($params) || empty($params) ) {
			return false;    
		}
		App::import('Core', 'HttpSocket');
		$HttpSocket = new HttpSocket();
		$html = $HttpSocket->get($url, $params);
		return $HttpSocket->response;
	}

	/* 
	 * Show response for ajax based on a boolean result
	 */    
	function __ajaxresponse($result = false){
		if(!$result) {
			return 'fail';
		}
		return 'success';
	}

	/* 
	 * Function for ping Google
	 */    
	function admin_ping_google() {
		   Configure::write('debug', 0);
		$url = 'http://www.google.com/webmasters/tools/ping';
		$params = 'sitemap=' . urlencode(FULL_BASE_URL . $this->sitemap_url);
		echo $this->__ajaxresponse($this->admin_check_ok_google( $this->__ping_site($url, $params) ));        
		exit();
	}

	/* 
	 * Function for check Google's response
	 */    
	function admin_check_ok_google($response = null){
		if( is_null($response) || !is_array($response) || empty($response) ) {
			return false;
		}
		if(
		   isset($response['status']['code']) && $response['status']['code'] == '200' &&
		   isset($response['status']['reason-phrase']) && $response['status']['reason-phrase'] == 'OK' &&
		   isset($response['body']) && !empty($response['body']) && 
		   strpos(strtolower($response['body']), "successfully added") != false) {
			return true;
		}
		return false;
	}

	/* 
	 * Function for ping Ask.com
	 */    
	function admin_ping_ask() { // fail if we are in local environment
		   Configure::write('debug', 0);
		$url = 'http://submissions.ask.com/ping';
		$params = 'sitemap=' .  urlencode(FULL_BASE_URL . $this->sitemap_url);
		echo $this->__ajaxresponse($this->__check_ok_ask( $this->__ping_site($url, $params) ));
		exit();
	}

	/* 
	 * Function for check Ask's response
	 */    
	function admin_check_ok_ask($response = null){
		if( is_null($response) || !is_array($response) || empty($response) ) {
			return false;
		}
		if(
		   isset($response['status']['code']) && $response['status']['code'] == '200' &&
		   isset($response['status']['reason-phrase']) && $response['status']['reason-phrase'] == 'OK' &&
		   isset($response['body']) && !empty($response['body']) && 
		   strpos(strtolower($response['body']), "has been successfully received and added") != false) {
			return true;
		}
		return false;
	}

	/* 
	 * Function for ping Yahoo
	 */    
	function admin_ping_yahoo() {
		   Configure::write('debug', 0);
		$url = 'http://search.yahooapis.com/SiteExplorerService/V1/updateNotification';
		$params = 'appid='.$this->yahoo_key.'&url=' . urlencode(FULL_BASE_URL . $this->sitemap_url);
		echo $this->__ajaxresponse($this->admin_check_ok_yahoo( $this->__ping_site($url, $params) ));
		exit();
	}

	/* 
	 * Function for check Yahoo's response
	 */    
	function admin_check_ok_yahoo($response = null){
		if( is_null($response) || !is_array($response) || empty($response) ) {
			return false;
		}
		if(
		   isset($response['status']['code']) && $response['status']['code'] == '200' &&
		   isset($response['status']['reason-phrase']) && $response['status']['reason-phrase'] == 'OK' &&
		   isset($response['body']) && !empty($response['body']) && 
		   strpos(strtolower($response['body']), "successfully submitted") != false) {
			return true;
		}
		return false;
	}

	/* 
	 * Function for ping Bing
	 */    
	function admin_ping_bing() {
		   Configure::write('debug', 0);
		$url = 'http://www.bing.com/webmaster/ping.aspx';
		$params = '&siteMap=' . urlencode(FULL_BASE_URL . $this->sitemap_url);
		echo $this->__ajaxresponse($this->admin_check_ok_bing( $this->__ping_site($url, $params) ));
		exit();
	}

	/* 
	 * Function for check Bing's response
	 */    
	function admin_check_ok_bing($response = null){
		if( is_null($response) || !is_array($response) || empty($response) ) {
			return false;
		}
		if(
		   isset($response['status']['code']) && $response['status']['code'] == '200' &&
		   isset($response['status']['reason-phrase']) && $response['status']['reason-phrase'] == 'OK' &&
		   isset($response['body']) && !empty($response['body']) && 
		   strpos(strtolower($response['body']), "thanks for submitting your sitemap") != false) {
			return true;
		}
		return false;
	}
}