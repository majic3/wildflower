<?php
class WildProfile extends AppModel {

	//The Associations below have been created with all possible keys, those that are not needed can be removed
	var $belongsTo = array(
			'WildUser' => array('className' => 'WildUser',
								'foreignKey' => 'user_id',
								'conditions' => '',
								'fields' => '',
								'order' => ''
			)
	);
	
	var $actsAs= array(
		'Image'=>array(
			'fields'=>array(
				'avatar'=>array(
					'thumbnail'=>array('create'=>true),
					'versions'=>array(
						array('prefix'=>'s',
									 'width'=>'35',
									 'height'=>'35',
						),
						array('prefix'=>'l',
									 'width'=>'68',
									 'height'=>'68',
						)
					)
				)
			)
		)
	);

}
?>