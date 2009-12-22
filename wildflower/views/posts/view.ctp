<div class="post" id="post-<?php echo $post['Post']['id']; ?>">
	<h2><?php echo $post['Post']['title']; ?></h2>
	<small class="post-date">Posted <?php echo $time->nice($post['Post']['created']); ?></small>
	
	<div class="entry"><?php echo $post['Post']['content']; ?></div>
	
	<?php if (!empty($post['Category'])) { ?>
	   <p class="postmeta">Posted in <?php echo $category->getList($post['Category']); ?>.</p>
	<?php } ?> 
	
	<?php echo $this->element('edit_this', array('id' => $post['Post']['id'])) ?>
</div>

<?php echo $this->element('edit_this', array('id' => $post['Post']['id'])) ?>
<p><?php echo $html->link('Back to all posts', '/' . Configure::read('Wildflower.blogIndex')) ?></p>

<?php if (!empty($post['Comment'])):
				$i = 0;	

				$class = null;
				
				$class = ($i++ % 2 == 0) ? $class = ' even' : ' odd';	?>
			<div id="comments" class="">
				<h3>Comments</h3>
<?php foreach ($post['Comment'] as $comment):
						?><div id="comment-<?php	echo ($comment['id']);	?>" class="comment mod bubble bubbleBottom discuss<?php	echo ($class);	?>">
							<b class="top"><b class="tl"></b><b class="tr"></b></b> 
							<div class="inner">
								<?php	echo "<p>", nl2br($comment['content']), "</p>";	?>
							</div>
							<b class="bottom"><b class="bl"></b><b class="br"></b></b> 
						</div>
						<div class="media attribution">
							<?php echo $gravatar->image($comment['email']); ?>
        <p class="comment-metadata">Posted by <?php echo $comment['url'] ? $html->link($comment['name'], $comment['url']) : $comment['name'] ?> 
        <?php echo $time->timeAgoInWords($comment['created']) ?></p>
        
        <div><p><?php echo $textile->format($comment['content']) ?></p></div>
		
						</div><?php
					endforeach;
				?>
			</div>
<?php endif; ?>

<h3>Post a comment</h3>
<?php
    if ($session->check('Message.flash')) {
        $session->flash();
    }
    
    $postUrl = Post::getUrl($post['Post']['slug']);
    echo $form->create('Comment', array('class' => 'comment-form', 'url' => $here, 'id' => 'PostAComment')),
        $form->input('name'),
        $form->input('email'),
        $form->input('url', array('label' => 'Website URL (optional)')),
        $form->input('content', array('label' => 'Message', 'type' => 'textbox')),
        '<div>',
        $form->hidden('post_id', array('value' => $post['Post']['id'])),
        '</div>',
        $form->hidden('Post.permalink', array('value' => $html->url($postUrl, true))),
        $form->submit('Post comment'),
        $form->end();
?>

