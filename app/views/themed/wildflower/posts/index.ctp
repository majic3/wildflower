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
					<p class="small">
						Posted by <span class="posted-by"><?php echo $post['User']['name'];?></span> on <span class="post-date"><?php echo $time->nice($post['Post']['created']); ?></small>
						<span class="comment-count">Comments <?php echo $post['Post']['comment_count']; ?></span>
					
						<?php if (!empty($post['Category'])): ?>
						  in <?php echo $category->getList($post['Category']); ?>
						<?php endif; ?>.
					</p>
					
					<p class="social">
						<?php
							echo $this->element(
								'social-buttons', 
								array(
									'title' => $post['Post']['title'], 
									'href' => Configure::read('Wildflower.puburl') . '/' . Configure::read('Wildflower.postsParent') . '/' . $post['Post']['slug']
								)
							);
						?>
					</p>
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
				<?php echo $this->element('admin_pagination') ?>
			</div>
		</div>
		
	</div>
	<div id="postsSidebar" class="sidebar lastUnit size1of5">
		<?php
				echo '<div class="nv vert">', $wild->catTree(), '</div>',
				$wild->latestCommentsList();
		?>
	</div>
</div>