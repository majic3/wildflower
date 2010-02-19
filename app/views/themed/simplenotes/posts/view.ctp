		<div id="post-<?php echo $post['Post']['id']; ?>" class="post unit size1of1">
			<div class="header">
				<h2><?php echo $post['Post']['title']; ?></h2>

					<p class="postmeta">Posted by <span class="posted-by"><?php echo $post['User']['name'];?></span> on <span class="post-date"><?php echo $time->nice($post['Post']['created']) ?></span>

					<?php if (!empty($post['Category'])) { ?> in <?php echo $category->getList($post['Category']); ?>
					<?php } ?>.
					</p>

					<p class="social"><?php		echo $this->element('social-buttons', array('title' => $post['Post']['title'], 'href' => Configure::read('Wildflower.puburl') . '/' . Configure::read('Wildflower.postsParent') . '/' . $post['Post']['slug']));	?></p>
			</div>
			
			<div class="section entry"><?php echo $post['Post']['content']; ?></div>
			
			<?php echo $this->element('edit_this', array('id' => $post['Post']['id'])) ?>
			<p><?php echo $html->link('Back to all posts', '/' . Configure::read('Wildflower.blogIndex')) ?></p>
		</div>
		<div class="unit size1of1">
			<?php if (!empty($post['Comment'])) { 
				$i = 0;	

				$class = null;
				
				$class = ($i++ % 2 == 0) ? $class = ' even' : ' odd';
			?>
			<div id="comments" class="size3of5 unit">
				<h3>Comments</h3>
				<?php
					foreach($post['Comment'] as $comment):
						?><div id="comment-<?php	echo ($comment['id']);	?>" class="comment mod bubble bubbleBottom discuss<?php	echo ($class);	?>">
							<b class="top"><b class="tl"></b><b class="tr"></b></b> 
							<div class="inner">
								<?php	echo "<p>", nl2br($comment['content']), "</p>";	?>
							</div>
							<b class="bottom"><b class="bl"></b><b class="br"></b></b> 
						</div>
						<div class="media attribution">
							<?php echo $gravatar->image($comment['email']); ?>
							<p><?php	echo $html->link(' <span class="author">' . $comment['name'] . '</span> ', $comment['url'], Array('rel' => 'nofollow'), false, false) . __('said') . ' <span class="when"> ' . $time->timeAgoInWords($comment['created']) . '</span>&#058; ';	?></p>
						</div><?php
					endforeach;
				?>
			</div>
			<?php
			}
			/* handle closed comments? */ if ($post['Post']['comments_allowed'] && !$post['Post']['comments_closed']) { ?>
			<div class="size2of5 lastUnit">
				<div id="commentFrm" class="mod">
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
			</div>
			<?php
				}
			if (!empty($post['Pingback'])) { 
				$i = 0;	

				$class = null;
				
				$class = ($i++ % 2 == 0) ? $class = ' even' : ' odd';
			?>
			<div id="pinkbacks" class="size1of1 lastUnit">
				<h3>Pingbacks</h3>
			</div>
			<?php
			} ?>
		</div>