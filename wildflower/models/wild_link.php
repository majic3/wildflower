<?php
class WildLink extends AppModel {

	var $name = 'WildLink';
	var $validate = array(
		'name' => array('notempty'),
		'url' => array('url')
	);	
	public $actsAs = array(
	   'Containable',
	   'Slug' => array('separator' => '-', 'overwrite' => true, 'label' => 'name')
	);

	//The Associations below have been created with all possible keys, those that are not needed can be removed
	var $hasAndBelongsToMany = array(
			'WildCategory' => array('className' => 'WildCategory',
						'joinTable' => 'wild_categories_wild_links',
						'foreignKey' => 'link_id',
						'associationForeignKey' => 'category_id',
						'unique' => true,
						'conditions' => '',
						'fields' => '',
						'order' => '',
						'limit' => '',
						'offset' => '',
						'finderQuery' => '',
						'deleteQuery' => '',
						'insertQuery' => ''
			)
	);
    
    /**
     * Get URL to a post, suitable for $html->url() and likes
     *
     * @param string $url (minus the http://)
     * @return string
     */
    static function getUrl($url) {
        $url = 'http://' . $url;
        return $url;
    }

    
    /**
     * Returns an array of rss urls for either admin dashboard or public view
     *
     * @param bool $public
     * @return array
     */
	function rssArray($public = true)	{
		$feeds = Array();	
        $this->recursive = 2;
		$conditions = Array('contain'=>array('WildCategory.slug = "rss"'));
		$links = $this->find('all', $conditions);

		foreach($links as $item)	{
			// use set here or some xpath ala felixge
			foreach($item['WildCategory'] as $cat)
				if($cat['slug'] == 'rss')
					$feeds[] = Array('name' => $item['WildLink']['name'], 'url' => $item['WildLink']['url']);
		}

		return $feeds;
	}

}
?>