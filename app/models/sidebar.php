<?php
/* have a really big plan around this : though as yet only a plan*/
class Sidebar extends AppModel {
    
    public $hasAndBelongsToMany = array('Page');
    
    function findBlogSidebar() {
        return $this->find('first', array('conditions' => array('on_posts' => 1), 'recursive' => -1));
    }
    
}