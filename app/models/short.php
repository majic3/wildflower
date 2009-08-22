<?php
class Short extends AppModel {

	/*	check if short exists. @model that is shortened, @id of that entry, @url is the table field name that is going to be shortened	*/
	function checkurl($url) {
		$obj = $this->findByUrl($url);
		$obj['Short']['slug'] = Configure::read('Wildflower.shorturl') . '/' . $obj['Short']['slug'];
		return ($obj) ? $obj['Short'] : false;
	}
	/*	check if short exists. @model that is shortened, @id of that entry, @url is the table field name that is going to be shortened	*/
	function check($model, $id, $url = 'url') {
		$urlprefix = false;

		if($model == 'Post')	{
			$model = 'Post';
			$urlprefix = '/' . Configure::read('Wildflower.postsParent') . '/';
			$url = 'slug';
		} else if($model == 'Page')	{
			$model = 'Page';
		}

		$obj = null;
		$obj = ClassRegistry::init($model)->findById($id);
		$url = $obj[$model][$url];

		$obj = $this->findByUrl(($urlprefix) ? $urlprefix . $url : $url);

		return ($obj) ? $obj['Short'] : false;
	}

	/*	make a short entry. @model that is shortened, @id of that entry, @url is the table field name that is going to be shortened - this might be better in the model	*/
	function make($model, $id, $url = 'url') {

		$urlprefix = false;

		if($model == 'Post')	{
			$model = 'Post';
			$urlprefix = '/' . Configure::read('Wildflower.postsParent') . '/';
			$url = 'slug';
		} else if($model == 'Page')	{
			$model = 'Page';
		}

		$obj = null;
		$obj = ClassRegistry::init($model)->findById($id);

		$url = $obj[$model][$url];
		$codeset = str_replace('/', 's', ($urlprefix) ? $urlprefix . $url : $url);

		$base = strlen($codeset);
		$n = 300;
		$converted = "";

		while ($n > 0) {
			$converted = substr($codeset, ($n % $base), 1) . $converted;
			$n = floor($n/$base);
		}
		return Array('slug' => '/' . Configure::read('Wildflower.shorturl') . '/' . $converted, 'id' => null); // 4Q
	}
}
