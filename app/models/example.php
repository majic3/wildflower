<?php
class Example extends AppModel {
	
	public $actsAs = array(
	   'Slug' => array('separator' => '-', 'overwrite' => true, 'label' => 'title'), 
		'Image'=>array(
			'fields'=>array(
				'photo'=>array(
					'thumbnail'=>array('create'=>true),
					'resize'=>array(
									 'width'=>'220',
									 'height'=>'220',
						),
					'versions'=>array(
						array('prefix'=>'s',
									 'width'=>'95',
									 'height'=>'95',
						),
						array('prefix'=>'l',
									 'width'=>'300',
									 'height'=>'300',
						)
					)
				)
			)
		)
    );

	public $useTable = 'examples';
    
    /**
     * Get URL to a post, suitable for $html->url() and likes
     *
     * @param string $slug
     * @return string
     */
    static function getUrl($slug) {
        $url = '/examples/' . $slug;
        return $url;
    }


}