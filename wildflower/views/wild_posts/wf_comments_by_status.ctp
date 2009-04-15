
	<div>
<?php if (empty($this->data['WildComment'])): ?>
    <p>No comments.</p>
<?php else: ?>
    <?php echo $this->element('wf_select_actions', array('actions' => array('Approve', 'Unapprove', 'Spam', 'Unspam', 'Delete'))); ?>
    
    <ol class="comments_list">
        <?php foreach ($this->data['WildComment'] as $i => $comment): ?>      
            <li id="comment-<?php echo $comment['id'] ?>" class="<?php echo ($i % 2 == 0) ? 'odd' : 'even'; ?>">
                <span class="row-check"><?php echo $form->checkbox('id.' . $comment['id']) ?></span>
                
                <em class="comment-metadata">Posted by <?php echo $comment['url'] ? $html->link($comment['name'], $comment['url']) : $comment['name'] ?> 
                <?php echo $time->timeAgoInWords($comment['created']) ?></em>

                <div><?php echo $textile->format($comment['content']) ?></div>
            </li>
        <?php endforeach; ?>
    </ol>
    
    <?php echo $this->element('wf_select_actions', array('actions' => array('Approve', 'Unapprove', 'Spam', 'Unspam', 'Delete'))); ?>
<?php endif; ?>
	</div>