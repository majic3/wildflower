<?php
class WildSetting extends WildflowerAppModel {
	
	public $validate = array(
	);
	public $useTable = 'settings';
	
    /**
     * @depracated This is not used right now
     *
     * Write setting key-value pairs to setting cache file
     *
     * @return bool
     */
    function createCache() {
        $settings = $this->findAll();
        $names = Set::extract($settings, "{n}.{$this->name}.name");
        $values = Set::extract($settings, "{n}.{$this->name}.value");
        $cachedSettings = array_combine($names, $values);
        $fileContent = json_encode($cachedSettings);
        return file_put_contents(SETTINGS_CACHE_FILE, $fileContent);
    }
    
    /**
     * Find all settings of given type and transform them to key => value array
     *
     * @param string $type
     * @return array
     * 
     * @TODO cache settings
     */
    function getKeyValuePairs() {
    	$settings = $this->find('all');
        $names = Set::extract($settings, "{n}.{$this->name}.name");
        $values = Set::extract($settings, "{n}.{$this->name}.value");
        $settings = array_combine($names, $values);
        return $settings;
    }	
    
    /**
     * Find find available themes
     *
     * @return array
     * 
     * @TODO cache settings
     */
    function getThemes() { 
		// list folders inside app/views/themed -using cake folder class
		App::import('Core', 'Folder');
		$folder = new Folder(); 
		$path = APP . DS . 'webroot' . DS . 'themed';
		$folder->cd($path); 
		$themesFolders = $folder->ls(); 
		$themes = Array();
		$themes['public']['default'] = 'default';
		$themes['admin']['default'] = 'default';

		foreach($themesFolders[0] as $k => $v)	{ 
		//	debug($v);
			if(strpos($v, 'Admin') === false)
				$themes['public'][$v] = $v;
			else
				$themes['admin'][str_replace('Admin', '', $v)] = str_replace('Admin', '', $v);
			
		}
		//debug($themes);
        return $themes;	
    }
	
}

