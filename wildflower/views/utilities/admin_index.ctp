<div id="content">
    <h3>Add content</h3>
    <?php
        echo
        $form->create('Utility', array('url' => $here)),
        $form->input('what', array(
            'type' => 'select',
            'options' => $uoptions,
        )),
        $form->input('how_many', array('size' => 5)),
        $form->end('Proceed');
    ?>
</div>

<div id="debug">
	<dl>
		<dt>cache settings</dt>
		<dd><?php	echo CACHE;	?></dd>
		<dd><?php	echo Configure::read('Wildflower.rootPageCache');	?></dd>
		<dd><?php	echo Configure::read('Wildflower.previewCache');	?></dd>
		<dd><?php	echo Configure::read('Wildflower.thumbnailsCache');	?></dd>
		<dd><?php	echo Configure::read('Wildflower.backups');	?></dd>
		<dd><?php	echo Configure::read('Wildflower.cakeLogs');	?></dd>
	</dl>
</div>

<div id="systemstatus">
    <h3>System Status</h3>
	
	<h4>Check System Status</h4>
	<div>
		<ul>
			<li><?php	echo $html->link('check', '/admin/utilities/chkcfg');	?></li>
		</ul>
	</div>

	<div id="sysStatusOutput"></div>
</div>

<div id="seo">
    <h3>SEO</h3>
	
	<h4>Sitemap</h4>
	<div>
		<ul>
			<li><?php	echo $html->link('send', '/admin/sitemaps/send');	?></li>
			<li><?php	echo $html->link('add dynamic', '#');	?></li>
			<li><?php	echo $html->link('add static', '#');	?></li>
		</ul>
	</div>
	
	<h4>Robots.txt</h4>
	<div></div>
	
	<h4>Rewrite Links</h4>
	<div></div>
</div>

<div id="databackup">
    <h3>Databack UP</h3>
	<div>
		<ul>
			<li><?php	echo $html->link('make backup', '/admin/utilities/makebackup');	?></li>
			<li><?php	echo $html->link('clear old backups', '/admin/utilities/clearbackups');	?></li>
		</ul>
		<div class="backups">
			<ul>
				<?php
					foreach($backups[1] as $backup):
						echo '<li>', $html->link($backup, '/admin/utilities/' . md5($backup)), '</li>';
					endforeach; ?>
			</ul>
		</div>
	</div>
</div>

<div id="cachectrl">
    <h3>Cache Control</h3>

	<h4>Static Cache</h4>

	<div id="staticCacheList" class="cacheList">
		<?php
			foreach($staticCache as $cacheType => $cache):
				if($cacheType === 0)	{
					echo '<h5>folders</h5>';
				} else {
					echo '<h5>files</h5>';
				}
				echo '<ul>';
				if($cache == array()):
					echo '<li>clear already</li>';
				else:
					foreach($cache as $cacheItem):
						if($cacheItem != 'empty' || $cacheItem != '..' || $cacheItem != '.'):
							echo '<li>', $html->link($cacheItem, '/admin/utilities/clearcache/' . $cacheItem), '</li>';
						endif;
					endforeach;
				endif;
				echo '</ul>';
			endforeach; ?>
	</div>

	<h4>Wildflower &amp; Cake Caches</h4>
	<div>
		<ul>
			<li><?php	echo $html->link('models', '/admin/utilities/clearcache/models');	?></li>
			<li><?php	echo $html->link('persistent', '/admin/utilities/clearcache/persistent');	?></li>
			<li><?php	echo $html->link('views', '/admin/utilities/clearcache/views');	?></li>
			<li><?php	echo $html->link('thumbnails', '/admin/utilities/clearcache/thumbnails');	?></li>
			<li><?php	echo $html->link('root pages', '/admin/utilities/clearcache/rootpages');	?></li>
		</ul>
	</div>

	<div id="cakeCacheList" class="cacheList">
		<?php
			debug($cakeCaches);
		?>
		<?php
			foreach($cakeCaches as $coreCache => $coreItem):
				debug($coreCache);
				debug($coreItem);
				foreach($coreItem as $cacheType => $cache):
					if($cacheType === 0)	{
						echo '<h5>folders</h5>';
					} else {
						echo '<h5>files</h5>';
					}
					debug($cacheType);
					debug($cache);
					echo '<ul>';
					if($cache == array()):
						echo '<li>clear already</li>';
					else:
						foreach($cache as $cacheItem):
							if($cacheItem != 'empty' || $cacheItem != '..' || $cacheItem != '.'):
								echo '<li>', $html->link($cacheItem, '/admin/utilities/clearcache/' . $cacheItem), '</li>';
							endif;
						endforeach;
					endif;
					echo '</ul>';
				endforeach; //*/
			endforeach;
		?>
	</div>
</div>

<div id="reviewLogs">
    <h3>Review Logs</h3>

	<div id="logsList" class="logList">
		<?php
				echo '<ul>';
			foreach($reviewLogs[1] as $log):
				if($log != 'empty'):
					echo '<li>', $html->link($log, '/admin/utilities/clearlogfile/' . $log), '</li>';
				endif;
			endforeach;
			echo '</ul>';
		?>
	</div>
</div>