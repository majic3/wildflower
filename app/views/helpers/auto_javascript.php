<?php 
/** File: auto_javascript.php **/
/**
 * Auto JavaScript Helper
 *
 * Facilitates JavaScript Automatic loading and inclusion for page specific JS
 *
 * @copyright   Copyright 2009, Graham Weldon
 * @author      Graham Weldon
 * @link        http://grahamweldon.com
 * @version     0.1
 * @license     http://www.opensource.org/licenses/mit-license.php The MIT License
 */
class AutoJavascriptHelper extends AppHelper {

/**
 * Options
 *
 * path => Path from which the controller/action file path will be built
 *         from. This is relative to the 'WWW_ROOT/js' directory
 *
 * @var array
 * @access private
 */
    private $__options = array('path' => 'autoload');

/**
 * View helpers required by this helper
 *
 * @var array
 * @access public
 */
    public $helpers = array('Javascript');

/**
 * Object constructor
 *
 * Allows passing in options to change class behavior
 *
 * @param string $options Key value array of options
 * @access public
 */
    public function __construct($options = array()) {
        $this->__options = am($this->__options, $options);
    }

/**
 * Before Render callback
 *
 *  plan to customise to bundle auto laoded scripts as a additional comined asset in asset plugin - perhaps if added to the plugin and used by and from within the asset helper of the plugin
 *
 * @return void
 * @access public
 */
    public function beforeRender() {
        extract($this->__options);
        if (!empty($path)) {
            $path .= DS;
        }

		$files = array(
            $this->params['controller'] . '.js',
            $this->params['controller'] . DS . $this->params['action'] . '.js');

		if($this->params['Wildflower']['view']['isHome'])	{
			$files[] = 'home.js';
		} elseif($this->params['Wildflower']['view']['isPage'])	{
			$files[] = substr($this->params['Wildflower']['view']['here'], -(strlen($this->params['Wildflower']['view']['here'])-1)).'.js';
		} elseif($this->params['Wildflower']['view']['isPosts']) {
			$files[] = 'posts.js'; // later be able to load per post script
		} else {
			$this->log('not page', 'autojavascript');
		}

        foreach ($files as $file) {
            $file = $path . $file;
            $includeFile = WWW_ROOT . 'js' . DS . $file;
			$this->log($includeFile, 'autojavascript');
            if (file_exists($includeFile)) {
                $this->Javascript->link(str_replace('\\', '/', $file), false);
            } else {
				$this->log("not found no issue: " . $includeFile, 'autojavascript');
			}
        }
    }
}
?>