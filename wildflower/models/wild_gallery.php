<?php
class WildGallery extends AppModel {

	var $name = 'WildGallery'; 
	public $actsAs = array(
	   'Slug' => array('separator' => '-', 'overwrite' => true, 'label' => 'name')
	);
	
	public static $statusOptions = array(
       '0' => 'wf-simple',
       '1' => 'flickr',
       '2' => 'director',
       '3' => 'youtube',
       '4' => 'vimeo',
       '5' => 'simple-gallery'
    );	 
    
    /**
     * Get URL to a gallery index, suitable for $html->url() and likes
     *
     * @param string $uuid
     * @return string
     */
    static function getUrl($slug) {
        $url = '/' . Configure::read('Wildflower.galleryIndex') . '/' . $slug;
        return $url;
    }
    
    /**
     * Get URL to a post, suitable for $html->url() and likes
     *
     * @param string $uuid
     * @return string
     */
    static function getUrlItem($slug, $itemName) {
        $url = '/' . Configure::read('Wildflower.galleryView') . '/' . $slug . '/' . $itemName;
        return $url;
    }

    /**
     * Mark a post as a draft
     *
     * @param int $id
     */
    function draft($id) {
        $id = intval($id);
        return $this->query("UPDATE {$this->useTable} SET draft = 1 WHERE id = $id");
    }  

    function getStatusOptions() {
        return self::$statusOptions;
    }

    /**
     * Publish a post (unmark draft status)
     *
     * @param int $id
     */
    function publish($id) {
        $id = intval($id);
        return $this->query("UPDATE {$this->useTable} SET draft = 0 WHERE id = $id");
    }  
    
	/**
     * Search title and content fields
     *
     * @param string $query
     * @return array
     */
    function search($query) {
    	$fields = array('id', 'title', 'slug');
    	$titleResults = $this->findAll("{$this->name}.name LIKE '%$query%'", $fields, null, null, 1);
    	$contentResults = array();
    	if (empty($titleResults)) {
    		$titleResults = array();
			$contentResults = $this->findAll("MATCH ({$this->name}.name) AGAINST ('$query')", $fields, null, null, 1);
    	}
    	
    	if (!is_array(($contentResults))) {
    		$contentResults = array();
    	}
    	
    	$results = array_merge($titleResults, $contentResults);
    	return $results;
    }

}
?>