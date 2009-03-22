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

}
?>