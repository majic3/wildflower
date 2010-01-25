<li id="image-browser" class="insert_image_sidebar">
    <h4>Insert an image - (<a href="#upload" class="upload">upload</a>)</h4>
    
    <?php if (empty($images)): ?>
        <p>No files uploaded yet.</p>
    <?php else: ?>

        <ul class="file-list">
        <?php 
		$mprefix = Configure::read('Wildflower.mediaRoute');
		foreach ($images as $file):
			$label = $file['Asset']['title'];
			if (empty($label)) {
				$label = $file['Asset']['name'];
			}
			$label = $text->truncate($label, 18, '...');
		?>

            <li id="file-<?php echo $file['Asset']['id']; ?>" class="actions-handle">

        	    <img class="thumbnail" width="50" height="50" src="<?php echo $html->url("/$mprefix/thumbnail/{$file['Asset']['name']}/50/50/1"); ?>" alt="<?php echo $file['Asset']['name']; ?>" />

                <h3><?php echo hsc($label); ?></h3>

                <span class="row-actions"><?php echo $html->link(__('View/Download', true), Asset::getUploadUrl($file['Asset']['name']), array('class' => 'permalink', 'rel' => 'permalink', 'title' => __('View or download this file.', true))); ?></span>

                <span class="cleaner"></span>
            </li>

        <?php endforeach; ?>
        </ul>

        <?php echo $this->element('admin_pagination'); ?>

    <?php endif; ?>
    
    <div id="resize_image">
        <h5>Resize</h5>
        Width: <input type="text" id="resize_x" name="data[Resize][width]" size="4"> px&nbsp;&nbsp; Height: <input type="text" name="data[Resize][height]" id="resize_y" size="4"> px&nbsp;&nbsp; Crop: <input type="text" name="data[Resize][crop]" id="crop" size="5" />
    </div>
    
    <div id="image_options">
        <h5>Image Options</h5>
        Class: <input type="text" id="format_class" name="data[Options][class]" size="6"> &nbsp;&nbsp; Alt: <input type="text" name="data[Options][alt]" id="alt_txt" size="7">
    </div>
    
    <span class="cleaner"></span>
    <button id="insert_image">Insert selected image</button>
    <span class="cleaner"></span>
</li>

<li class="sidebar-box insert_image_sidebar">
    <?php echo $this->element('../assets/_upload_file_box'); ?>
</li>

<li class="insert_link_sidebar">
    <a class="cancel" href="#Close">Close insert image sidebar</a>
</li>
