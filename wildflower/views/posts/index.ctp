<div id="primary-content" class="rightCol">
	<?php
		$cssClasses = array('post');
		if (isset($this->params['ChangeIndicator'])) {
			$changedId = $this->params['ChangeIndicator']['id'];
			if ($changedId == $post['Post']['id']) {
				array_push($cssClasses, 'changed');
				unset($this->params['ChangeIndicator']);
			}
		}
	
		foreach ($posts as $post):
			$postLink = Post::getUrl($post['Post']['slug']);
			$postContent = $wild->trunPostsForIndex($postLink, $post['Post']['content'], true); ?>
	<div class="<?php echo join(' ', $cssClasses) ?>" id="post-<?php echo $post['Post']['id'] ?>">
		<h2><?php echo $html->link($post['Post']['title'], $postLink); ?></h2>
		<small class="post-date">Posted <?php echo $time->nice($post['Post']['created']) ?></small>
		
		<div class="entry"><?php echo $postContent; ?></div>
		
		<?php if (!empty($post['Category'])): ?>
		<p class="postmeta">Posted in <?php echo $category->getList($post['Category']); ?>.</p>
		<?php endif; ?>
		
		<?php echo $this->element('edit_this', array('id' => $post['Post']['id'])); ?>
		
	</div>
		<?php endforeach; ?>

	<?php echo $this->element('pagination') ?>
</div>

<div class="main">
	<div class="line">
		<div class="unit size1of1">
			<?php	echo $wild->processWidgets($wfPostsSidebar['Sidebar']['content']);	?>
		</div>
		<div class="unit size1of2">
			<h3>Categories</h3>
			<?php echo $wild->menu('dynamicCats', array());  ?>
		</div>
		<div class="lastUnit size1of2">
			<h3>Latest Comments</h3>
			<?php echo $wild->menu('latestComments', array());  ?>
		</div>
	</div>
</div>