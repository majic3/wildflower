<?php
class Category extends AppModel {

    public $actsAs = array(
        'Containable',
        'Tree', 
        'Sluggable' => array('label' => 'title')
    );
    public $validate = array(
        'title' => VALID_NOT_EMPTY
    );
    public $hasAndBelongsToMany = array('Post');
    
    function beforeSave() {
        parent::beforeSave();
        if (isset($this->data['Category']['parent_id']) and !is_numeric($this->data['Category']['parent_id'])) {
            unset($this->data['Category']['parent_id']);
        }
        return true;
    }

}
