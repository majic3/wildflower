<?php
class AssetsController extends AppController {
	
	public $helpers = array('Cache');
	public $components = array('RequestHandler', 'Wildflower.JlmPackager');
	public $paginate = array(
        'limit' => 20,
        'order' => array('created' => 'desc')
    );
	
	function admin_create() {
	    $this->Asset->create($this->data);
	    
	    if (!$this->Asset->validates()) {
	        $this->feedFileManager();
	        return $this->render('admin_index');
	    }
	    
	    // @TODO replace upload logic with Asset::upload()
		$isUploaded = $this->upload();

		//debug($isUploaded); die();
		$this->Session->setFlash('File uploaded.', 'flash_success');
        
        $this->redirect($this->referer(Configure::read('Wildflower.prefix') . '/assets'));
	}

	/**
	 * Files overview
	 *
	 */
	function admin_index($filter=null) {
        if($filter){
			$this->paginate = array(
			'conditions' => array('Asset.category_id' => $filter),
			'limit' => 12,
			'order' => array('created' => 'desc')
			);
		}
		$this->feedFileManager($filter);
	}
	
	/**
	 * Delete an upload
	 *
	 * @param int $id
	 */
	 // @TODO make require a POST
	function admin_delete($id) {
	    $this->Asset->delete($id);
		$this->redirect(array('action' => 'index'));
	}
	
	/**
	 * Edit a file
	 *
	 * @param int $id
	 */
	function admin_edit($id) {
		$this->data = $this->Asset->findById($id);
		$AssetTags = false; // $this->Asset->findTags();
		$this->pageTitle = $this->data[$this->modelClass]['title'];
		$tagCloud = $this->Asset->tagCloud();
		
		$this->set(compact('tagCloud', 'Asset'));

	}
	
	/**
	 * Insert image dialog
	 *
	 * @param int $limit Number of images on one page
	 */
	function admin_insert_asset() {
		$this->autoLayout = false;
		$this->paginate['limit'] = 10;
		$assets = $this->paginate($this->modelClass);
		$tag_cloud = $this->Asset->tagCloud();
		$this->set(compact('assets', 'tag_cloud'));
	}
	
	/**
	 * Insert image dialog
	 *
	 * @param int $limit Number of images on one page
	 */
	function admin_insert_image() {
		$this->autoLayout = false;
		$this->paginate['limit'] = 10;
		$this->paginate['conditions'] = "{$this->modelClass}.mime LIKE 'image%'";
		$images = $this->paginate($this->modelClass);
		$tag_cloud = $this->Asset->tagCloud();
		$this->set(compact('images', 'tag_cloud'));
	}
	
	function admin_browse_images() {
		$this->paginate['limit'] = 6;
		$this->paginate['conditions'] = "{$this->modelClass}.mime LIKE 'image%'";
		$images = $this->paginate($this->modelClass);
		$this->set('images', $images);
	}
	
	function admin_update() {
	    //$this->Asset->create($this->data);
	    //if (!$this->Asset->exists()) return $this->cakeError('object_not_found');

		if(isset($this->data['Asset']['file']))	{
			//	$isUploaded = Asset::upload($this->data['Asset']['file']);
			$isUploaded = $this->upload(false);
			if($isUploaded)	{
				$this->Session->setFlash('file updated', 'flash_success');
			} else {
				$this->Session->setFlash('file NOT updated', 'flash_error');
			}
		}
		
		if($this->Asset->saveField('title', $this->data[$this->modelClass]['title'])) {
			$this->Session->setFlash('title updated', 'flash_success');
		} else {
			$this->Session->setFlash('title NOT updated', 'flash');
		}


		//$this->redirect(array('action' => 'index'));
		$this->redirect(array('action' => 'edit', 'id' => $this->data['Asset']['id']));
		//$this->render('admin_edit');
	}
	
	function beforeFilter() {
		parent::beforeFilter();
		
		// Upload limit information
        $postMaxSize = ini_get('post_max_size');
        $uploadMaxSize = ini_get('upload_max_filesize');
        $size = $postMaxSize;
        if ($uploadMaxSize < $postMaxSize) {
            $size = $uploadMaxSize;
        }
        $size = str_replace('M', 'MB', $size);
        $limits = "Maximum allowed file size: $size";
        $this->set('uploadLimits', $limits);
	}
    
    /**
     * Output parsed JLM javascript file
     *
     * The output is cached when not in debug mode.
     */
    function admin_jlm() {
        $javascripts = Cache::read('admin_jlm'); 
        $this->RequestHandler->respondAs('application/javascript');
        if (empty($javascripts) or Configure::read('debug') > 0) {
            $javascripts = $this->JlmPackager->concate();
            Cache::write('admin_jlm', $javascripts);
			// this makes the debugkit work with wf
			Configure::write('debug', 0);
	        $this->JlmPackager->browserCacheHeaders(filemtime($file));
			die($javascripts);
        }
        
        $this->layout = false;
        $this->set(compact('javascripts'));
        $this->RequestHandler->respondAs('application/javascript');
        
        $cacheSettings = Cache::settings();
        $file = CACHE . $cacheSettings['prefix'] . 'admin_jlm';
        $this->JlmPackager->browserCacheHeaders(filemtime($file));
        
        Configure::write('debug', 0);
    }
    
    function thumbnail_by_id($id, $width = 120, $height = 120, $crop = 0) {
        $asset = $this->Asset->read(null, $id);
        $this->wfthumbnail($asset['Asset']['name'], $width, $height, $crop);
    }
    
    /**
     * Create a thumbnail from an image, cache it and output it
     *
     * @param $imageName File name from webroot/uploads/
     */
    function thumbnail($imageName, $width = 120, $height = 120, $crop = 0) {
		$this->wfthumbnail($imageName, $width, $height, $crop);
    }
    
    /**
     * Create a thumbnail from an image, cache it and output it
     *
     * @param $imageName File name from webroot/uploads/
     */
    private function wfthumbnail($imageName, $width = 120, $height = 120, $crop = 0, $newName = false) {

		$tail = '';
		
		//debug($this); die();

		$imgType = explode('.', $imageName);
		$imageType = $imgType[1];
		$enlarge = false;

		if(is_array($newName))	{
			// we are going to cache a file $newName of the $imageName to a dir location
			$cacheDir = $newName['dir'];
			$cachedFileName = str_replace('.' . $imageType, $newName['tail'], $imageName) . '.' . $imageType;
			$enlarge = (isset($newName['enlarge'])) ? $newName['enlarge'] : 'false';
		}

		$imageMime = ($imageType == 'jpg') ? 'image/jpeg' : ('image/' . $imageType);
        $this->autoRender = false;
        
        $imageName = str_replace(array('..', '/'), '', $imageName); // Don't allow escaping to upper directories

        $width = intval($width);
        if ($width > 2560) {
        	$width = 2560;
        }

		$height = intval($height);
		if ($height > 1600) {
			$height = 1600;
		}

		if(!$cachedFileName)	{
			$cachedFileName = join('_', array($imageName, $width, $height, $crop)) . '.' . $imageType;
		}

		if(!$cacheDir)	{
	        $cacheDir = Configure::read('Wildflower.thumbnailsCache');
		}
        $cachedFilePath = $cacheDir . DS . $cachedFileName;

        $refreshCache = false;
        $cacheFileExists = file_exists($cachedFilePath);
        if ($cacheFileExists) {
        	$cacheTimestamp = filemtime($cachedFilePath);
        	$cachetime = 60 * 60 * 24 * 14; // 14 days
        	$border = $cacheTimestamp + $cachetime;
        	$now = time();
        	if ($now > $border) {
        		$refreshCache = true;
        	}
        }

        if ($cacheFileExists && !$refreshCache) {
        	return $this->_renderImage($cachedFilePath, $imageMime);
        } else {
        	// Create cache and render it
        	$sourceFile = Configure::read('Wildflower.uploadDirectory') . DS . $imageName;
        	if (!file_exists($sourceFile)) {
        		return trigger_error("Thumbnail generator: Source file $sourceFile does not exists.");
        	}

        	App::import('Vendor', 'phpThumb', array('file' => 'phpthumb.class.php'));

        	$phpThumb = new phpThumb();

        	$phpThumb->setSourceFilename($sourceFile);
        	$phpThumb->setParameter('config_output_format', $imageType);

        	$phpThumb->setParameter('w', intval($width));
        	$phpThumb->setParameter('h', intval($height));
        	$phpThumb->setParameter('zc', intval($crop));

			if($enlarge)	{
				$phpThumb->setParameter('aoe', ($enlarge == 'true') ? true : false);
			}

        	if ($phpThumb->GenerateThumbnail()) {
        		$phpThumb->RenderToFile($cachedFilePath);
        		return $this->_renderImage($cachedFilePath, $imageMime);
        	} else {
        		return trigger_error("Thumbnail generator: Can't GenerateThumbnail.");
        	}
        }
    }
    
    function _renderImage($cachedFilePath, $mime = 'image/jpeg') {
        $this->JlmPackager->browserCacheHeaders(filemtime($cachedFilePath), $mime);
        
        $fileSize = filesize($cachedFilePath);
        header("Content-Length: $fileSize");
        
        $cache = fopen($cachedFilePath, 'r');
        fpassthru($cache);
        fclose($cache);
    }

	/**
	 * Make a croped thumb square and also make a standard size preview of full image.
	 * The cached preview images are only used by admin
	 *
	 * @todo code the function
	 *
	 */
	function admin_preview_image($id) {
		$previewImageSettings = array(
			'dir' => WWW_ROOT . 'wildflower' . DS . 'img' . DS . 'assets' . DS
		);

		$id = basename($this->params['url']['url']);

		//$asset = $this->Asset->read(null, $id);

		$this->wfthumbnail(
			$id, 95, 95, 1, 
			am(
				$previewImageSettings,
				array(
					'tail' => '_cropped',
					'enlarge' => false
				)
			)
		);
		$this->wfthumbnail(
			$id, 325, 275, 0, 
			am(
				$previewImageSettings,
				array(
					'tail' => '_preview',
					'enlarge' => false
				)
			)
		);
    }

	/**
	 * Uploads either a new/ replacement image
	 *
	 * @todo move to model
	 * returns false or update array if successful
	 */
	private function upload($rename = true) {
	    // sluggify the name then remake suffix
	    $fileName = $this->slug($this->data[$this->modelClass]['file']['name'], '-');
		$fileName = substr_replace($fileName, '.', strrpos($fileName, '-'), strlen('-'));
        $uploadPath = Configure::read('Wildflower.uploadDirectory') . DS . $fileName;

		/*Configure::write('debug', 1);
		debug($this->data);
		debug($fileName); die(); */
        
        // Rename file if already exists
		if($rename)	{
			$i = 1;
			while (file_exists($uploadPath)) {
				// Append a number to the end of the file,
				// if it alredy has one increase it
				$newFileName = explode('.', $fileName);
				$lastChar = mb_strlen($newFileName[0], Configure::read('App.encoding')) - 1;
				if (is_numeric($newFileName[0][$lastChar]) and $newFileName[0][$lastChar - 1] == '-') {
					$i = intval($newFileName[0][$lastChar]) + 1;
					$newFileName[0][$lastChar] = $i;
				} else {
					$newFileName[0] = $newFileName[0] . "-$i";
				}
				$newFileName = implode('.', $newFileName);
				$uploadPath = Configure::read('Wildflower.uploadDirectory') . DS . $newFileName;
				$fileName = $newFileName;
			}
		}

		// Upload file
		$isUploaded = @move_uploaded_file($this->data[$this->modelClass]['file']['tmp_name'], $uploadPath);

		if (!$isUploaded) {
			$this->Asset->invalidate('file', 'File can`t be moved to the uploads directory. Check permissions.');
			//$this->feedFileManager();
			//return $this->render('admin_index');
			$this->Session->setFlash('File can`t be moved to the uploads directory. Check permissions.', 'flash_error');
			return false;
		}

		// Make this file writable and readable
		chmod($uploadPath, 0777);

		$this->Asset->data[$this->modelClass]['name'] = $fileName;
		if (empty($this->Asset->data[$this->modelClass]['title'])) {
			$this->Asset->data[$this->modelClass]['title'] = str_replace(array('.jpg', '.jpeg', '.gif', '.png'), array('', '', '', ''), $fileName);
		}
		$this->Asset->data[$this->modelClass]['mime'] = $this->Asset->data[$this->modelClass]['file']['type'];

		return $this->Asset->save();
		//*/
	}

	/**
	 * Feed images to various views
	 *
	 * @todo code functionality to allow single file pagination and retain 
	 * the pagination set across paged clicks
	 *
	 */
	private function feedFileManager($filter) {
		// Categories for select box
		$categories = $this->Asset->Category->find('list', array('fields' => array('id', 'title'), 'conditions' => array('Category.parent_id' => 61)));
		$this->pageTitle = 'Files';
		if(isset($_GET['displayNumImgs'])) $this->paginate['limit'] = Sanitize::escape($_GET['displayNumImgs']);
		$files = $this->paginate($this->modelClass);

		$displayNumImgsArr = array(10 => '10 files', 20 => '20 files', 50 => "50 files", 80 => "80 files");
		$totalImages = $this->Asset->find('count');

		$tag_cloud = $this->Asset->tagCloud();

		$displayNumImgs = $this->paginate['limit'];

		$this->set(
			compact(
				'files',
				'displayNumImgs',
				'displayNumImgsArr',
				'totalImages',
				'tag_cloud',
				'filter',
				'categories'
			)
		);
	}
    
}
