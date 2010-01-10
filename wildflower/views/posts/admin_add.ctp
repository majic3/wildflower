<div id="content">
<?php 
    echo 
    $this->element('posts/form');
?>
</div>


<ul id="sidebar">
    <li>
        <ul class="sidebar-menu">
            <li><?php echo $html->link('Title & Content', array('action' => 'admin_edit'), array('class' => 'current')); ?></li>
            <li class="allPosts">
			<strong><?php echo $htmla->link('All Posts', array('action' => 'index'), array('strict' => true)); ?></strong>
			<?php if(isset($jumpMenu)):
				echo str_replace(array('&amp;nbsp;', '&nbsp;', '&amp;amp;', '&amp;'), '', $form->select('jumpMenu', $jumpMenu, null, array('class' => 'jumpMenu')));
			endif; ?></li>
            <li><?php echo $html->link('Categories', array('action' => 'admin_edit_categories')); ?></li>
        </ul>
    </li>
    <li><?php echo $html->link(
        '<span>Write a new post</span>', 
        array('action' => 'add'),
        array('class' => 'add', 'escape' => false)) ?></li>
    <li>
        <?php
            echo
            $form->create('Post'),
            $form->input('query', array('label' => __('Find a post by typing', true))),
            $form->end();
        ?>
    </li>
</ul>