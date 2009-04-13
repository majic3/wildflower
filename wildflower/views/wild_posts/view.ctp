<?php
/* oo css type - sass or compass seo classes later */
?><div class="line">
	<div class="post" id="post-<?php echo $post['WildPost']['id']; ?>">
		<h2><?php echo $post['WildPost']['title']; ?></h2>
		<small class="post-date">Posted <?php echo $time->nice($post['WildPost']['created']); ?></small>
		
		<div class="entry"><?php echo $post['WildPost']['content']; ?></div>
		
		<?php if (!empty($post['Category'])) { ?>
		   <p class="postmeta">Posted in <?php echo $category->getList($post['Category']); ?>.</p>
		<?php } ?> 
		
		<?php echo $this->element('edit_this', array('id' => $post['WildPost']['id'])) ?>
	</div>

	<p><?php echo $html->link('Back to all posts', '/' . Configure::read('Wildflower.blogIndex')) ?></p>
</div>

<div class="line">
		<?php if (!empty($post['WildComment'])) { 
			$i = 0;	

			$class = null;
			
			$class = ($i++ % 2 == 0) ? $class = ' even' : ' odd';
		?>
		<div id="comments" class="size2of3 unit">
			<h3>Comments</h3>
			<?php
				foreach($post['WildComment'] as $comment):
					?><div class="comment line<?php	echo ($class);	?>">
						<div class="authorMedta">
							<p><?php echo $gravatar->image($comment['email'],
								  array(
									'default' => '/img/gravatar/default.png'
								  )
								); ?><!-- span class="author"><?php	echo ($html->link($comment['name'], $comment['url']));	?></span --></p>
						</div>
						<div class="commentBody">
							<p><?php	echo $html->link('<span class="author">' . $comment['name'] . '</span> ', $comment['url'], Array('rel' => 'nofollow'), false, false) . __('said') . ' <span class="when"> ' . $time->timeAgoInWords($comment['created']) . '</span>&#058; ';	?></span></p>
							<?php	echo nl2br($comment['content'])	?>
						</div>
					</div><?php
				endforeach;
			?>
		</div>
		<?php
		} ?>

		<?php /* handle closed comments? */ if ($post['WildPost']['allowComments']) { ?>
			<div id="commentFrm" class="size1of3 lastUnit">
			<h3>Post a comment</h3>
		<?php
		if ($session->check('Message.flash')) {
			$session->flash();
		}


		/* jquery wysiwyg */
		$postUrl = WildPost::getUrl($post['WildPost']['uuid']);
		echo $form->create('WildComment', array('class' => 'vform', 'url' => $here, 'id' => 'PostAComment')),
		$form->input('name'),
		$form->input('email'),
		$form->input('url', array('label' => 'Website URL (optional)')),
		$form->input('content', array('label' => 'Message', 'type' => 'textbox')),
		'<div>',
		$form->hidden('wild_post_id', array('value' => $post['WildPost']['id'])),
		'</div>',
		$form->hidden('WildPost.permalink', array('value' => $html->url($postUrl, true))),
		$form->submit('Post comment'),
		$form->end(); ?>
			</div>
		<?php	} ?>
	</div>
</div>

