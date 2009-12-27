<?php
class Utility extends AppModel {
    public $useTable = false;

	// want to be able to update this with the config wildflower units
    static public $models = array(
        'posts' => 'Blog Posts',
        'pages' => 'Pages',
        'categories' => 'Categories',
    );
}
