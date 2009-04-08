<?php
class WildSitemapsController extends AppController{

    var $uses = array('WildPost', 'WildPage');
    var $helpers = array('Time');
    var $components = array('RequestHandler');

    function index (){    
        $this->set('posts', $this->WildPost->find('all', array( 'conditions' => array('draft'=>0), 'fields' => array('updated','uuid', 'title'))));
        $this->set('pages', $this->WildPage->find('all', array( 'conditions' => array('draft' => 0), 'order' => 'lft ASC', 'fields' => array('updated','id','url', 'title'))));
//debug logs will destroy xml format, make sure were not in drbug mode
Configure::write ('debug', 0);
    }
} 