<div class="line">
	<div id="posts" class="unit size4of5">

		<?php
			$cssClasses = array('post');
			if (isset($this->params['ChangeIndicator'])) {
				$changedId = $this->params['ChangeIndicator']['id'];
				if ($changedId == $post['Post']['id']) {
					array_push($cssClasses, 'changed');
					unset($this->params['ChangeIndicator']);
				}
			}
		?>

		<?php foreach ($posts as $post) { ?>
		<div class="<?php echo join(' ', $cssClasses) ?> line" id="post-<?php echo $post['Post']['id'] ?>">
			<div class="unit size1of1">
				<div class="header">
					<h2><?php echo $html->link($post['Post']['title'], Post::getUrl($post['Post']['slug'])); ?></h2>
					<p class="quiet">
						<small class="post-date">Posted <?php echo $time->nice($post['Post']['created']) ?></small>
						<small class="comment-count">Comments 99</small>
					</p>
					
					<?php if (!empty($post['Category'])): ?>
					<p class="postmeta">Posted in <?php echo $category->getList($post['Category']); ?>.</p>
					<?php endif; ?>
					
					<p class="scoial">social links eg digg, facebook, tweetme etc</p>
				</div>
				
				<div class="section excerpt">
					<?php echo $wild->processWidgets($wild->extractContent($post['Post']['content'], Configure::read('Wildflower.blogExerpt'))); ?>
					<?php echo $html->link('read full post', Post::getUrl($post['Post']['slug'])); ?>
				</div>
				
				<?php echo $this->element('edit_this', array('id' => $post['Post']['id'])); ?>
			</div>
		</div>
		<?php } ?>
		<div class="line">
			<div class="unit size1of1">
				<?php echo $this->element('wf_pagination') ?>
			</div>
		</div>
		
	</div>
	<div id="postsSidebar" class="sidebar lastUnit size1of5">
		<p>sidebar should have automated menu of cats</p>
		<?php	
			//echo $wild->processElements("[e:posts-cats cats=\"$categories\"]");
		?>
	</div>
</div>