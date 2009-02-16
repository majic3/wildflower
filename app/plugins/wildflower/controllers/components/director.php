<?php
/**
  * Director Component
  * @author Sam@Majic3
  * @license MIT
  * @version 0.1
  * @based on Flickr Comp by RosSoft & To Wonder
*/

define("DIRECTOR_CACHE_DIR",Configure::read('Director.cache'));

class DirectorComponent extends Component		{

	  /** 
	   * PAth & Api Key. Change to your own
	   * @var string		
	   * @link http://www.slideshowpro.com (for more info the data you need is in system info when you log into your direcotor install)
	   */

	var $_path="PATH";
	var $_api_key="API_KEY";





		function startup($controller){

			$this->_api_key=Configure::read('Director.api_key');
			$this->_path=Configure::read('Director.path');

			app::import('Vendor','Director',array('file'=>'director'.DS.'DirectorPHP.php'));
		  //FlickrComponent instance of controller is replaced by a phpFlickr instance
			   $controller->director =& new Director($this->_api_key, $this->_path);
				if (!is_dir(DIRECTOR_CACHE_DIR))	{
				  mkdir(DIRECTOR_CACHE_DIR,0777);
				}
			   $controller->set("director",$controller->director);
			  }

}

?>