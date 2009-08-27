<div class="line">
	<div class="size4of5 unit">
		<div class="line">
			<div class="post lastUnit" id="post-<?php echo $post['Post']['id']; ?>">
				<div class="header">
					<h2><?php echo $post['Post']['title']; ?></h2>
						Posted by <small class="posted-by"><?php echo $post['User']['name'];?></small> on <small class="post-date"><?php echo $time->nice($post['Post']['created']) ?></small>
				</div>
				
				<div class="section entry"><?php echo $post['Post']['content']; ?></div>
				
				<div>
				<?php if (!empty($post['Category'])) { ?>
				   <p class="postmeta">Posted in <?php echo $category->getList($post['Category']); ?>.</p>
				<?php } ?>
				</div>
				
				<?php echo $this->element('edit_this', array('id' => $post['Post']['id'])) ?>
			<p><?php echo $html->link('Back to all posts', '/' . Configure::read('Wildflower.blogIndex')) ?></p>
			</div>
		</div>

		<div class="line">
				<?php if (!empty($post['Comment'])) { 
					$i = 0;	

					$class = null;
					
					$class = ($i++ % 2 == 0) ? $class = ' even' : ' odd';
				?>
				<div id="comments" class="size2of3 unit">
					<h3>Comments</h3>
					<?php
						foreach($post['Comment'] as $comment):
							?><div class="comment line<?php	echo ($class);	?>">
								<div class="authorMedta">
									<p><?php echo $gravatar->image($comment['email']); ?><!-- span class="author"><?php	echo ($html->link($comment['name'], $comment['url']));	?></span --></p>
								</div>
								<div class="commentBody">
									<p><?php	echo $html->link(' <span class="author">' . $comment['name'] . '</span> ', $comment['url'], Array('rel' => 'nofollow'), false, false) . __('said') . ' <span class="when"> ' . $time->timeAgoInWords($comment['created']) . '</span>&#058; ';	?></p>
									<?php	echo "<p>", nl2br($comment['content']), "</p>";	?>
								</div>
							</div><?php
						endforeach;
					?>
				</div>
				<?php
				} ?>

				<?php /* handle closed comments? */ if ($post['Post']['comments_allowed'] && !$post['Post']['comments_closed']) { ?>
					<div id="commentFrm" class="size1of3 lastUnit">
						<h3>Post a comment</h3>
						<?php
						if ($session->check('Message.flash')) {
							$session->flash();
						}

						/* jquery wysiwyg? */
						$postUrl = Post::getUrl($post['Post']['uuid']);
						echo $form->create('Comment', array('class' => 'vform', 'url' => $here, 'id' => 'PostAComment')),
						$form->input('name'),
						$form->input('email'),
						$form->input('url', array('label' => 'Website URL (optional)')),
						$form->input('content', array('label' => 'Message', 'type' => 'textbox')),
						'<div>',
						$form->hidden('post_id', array('value' => $post['Post']['id'])),
						'</div>',
						$form->hidden('Post.permalink', array('value' => $html->url($here, true))),
						$form->submit('Post comment'),
						$form->end();
						?>
					</div>
				<?php	} ?>
			</div>
		</div>
		<div class="size1of5 lastUnit">
			<?php	
				echo $wild->postsFromCategory($post['Post']['id']),
				$wild->latestCommentsList();
			?>
		</div>
</div>