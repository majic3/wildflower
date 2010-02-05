<?php
class UtilitiesController extends AppController {

	public $components = array('Security');
	public $uses = array('Post', 'Page', 'Utility');

	function beforeFilter() {
		parent::beforeFilter();
		
		// This stuff is only avaible in debug modes - its completely wrong anyway
		//if (Configure::read('debug') < 1) {
			return $this->do404();
		//}
		
		$this->Security->requireAuth('admin_index');
		$this->pageTitle = 'Developer Utilities';
	}
		
	function admin_index() {
		if (!empty($this->data)) {
			$addWhat = '_massAdd' . ucwords($this->data['Utility']['what']);
			$howMany = intval($this->data['Utility']['how_many']);
			$this->{$addWhat}($howMany);
		}

		$uoptions = Utility::$models;

		$backups = $this->listBackups();

		$staticCache = $this->listCache();

/*	'rootPageCache' => CACHE . 'wf_root_pages',
	'previewCache' => CACHE . 'wf_previews',
	'thumbnailsCache' => CACHE . 'wf_thumbnails',

	models
	persistent
	views

*/
		$cakeCaches['rootPageCache'] = $this->listCache(basename(Configure::read('Wildflower.rootPageCache')));
		$cakeCaches['previewCache'] = $this->listCache(basename(Configure::read('Wildflower.previewCache')));
		$cakeCaches['thumbnailsCache'] = $this->listCache(basename(Configure::read('Wildflower.thumbnailsCache')));
		$cakeCaches['models'] = $this->listCache('models');
		$cakeCaches['persistent'] = $this->listCache('persistent');
		$cakeCaches['views'] = $this->listCache('views');

		$reviewLogs = $this->listLogs();

		$this->set(compact('uoptions', 'backups', 'staticCache', 'cakeCaches', 'reviewLogs'));
	}

	function listBackups() {
		$return = '';
		App::import('Core', Array('Folder', 'File'));
		$Fldr = new Folder();
		$Fldr->cd(Configure::read('Wildflower.backups'));
		$return = $Fldr->read();
		return $return;
	}

	function makeBackup() {
		$return = '';
		$Fldr = new Folder();
		$Fldr->cd(Configure::read('Wildflower.backups'));
		$return = $Fldr->read();
		return $return;
	}

	function reinstateBackup() {
		$return = '';
		$Fldr = new Folder();
		$Fldr->cd(Configure::read('Wildflower.backups'));
		$return = $Fldr->read();
		return $return;
	}

	function chkcfg() {
		$return = '';
		return $return;
	}

	function listCache($which = 'static') {
		$cache = ($which == 'static') ? Configure::read('Wildflower.staticCache') : CACHE . DS . $which;
		$return = '';

		if(file_exists($cache) && is_dir($cache))	{
			$Fldr = new Folder();
			$Fldr->cd($cache);
			$return = $Fldr->read();
		} elseif(file_exists($cache) && !is_dir($cache))	{
		
		}

		return $return;
	}

	function clearCache($which = 'views') {
		$return = '';
		return $return;
	}

	function listLogs() {
		$return = '';
		$Fldr = new Folder();
		$Fldr->cd(Configure::read('Wildflower.cakeLogs'));
		$return = $Fldr->read();
		return $return;
	}

	function _massAddPosts($howMany = 10) {
		@set_time_limit(60 * 60);
		App::import('Vendor', 'Randomizer', array('file' => 'randomizer.php'));
		$randomizer = new Randomizer;
		for ($i = 0; $i < $howMany; $i++) {
			$post = array(
				'title' => $randomizer->title(),
				'content' => $randomizer->text(),
				'user_id' => $this->getLoggedInUserId(),
				'parent_id' => $randomizer->parentId($this->Post->id),
			);
			$this->Post->create($post);
			$this->Post->save();
		}
	}
}