<h2 class="section">Welcome to <?php echo $siteName ?> administration</h2>

<?php
    $labels = array(
        'Page' => array(
            'name' => __('Page', true),
            'link' => '/pages/edit/:id',
            'class' => 'page'
        ), 
        'Post' => array(
            'name' => __('Post', true),
            'link' => '/posts/edit/:id',
            'class' => 'post'
        ),
        'Comment' => array(
            'name' => __('Comment', true),
            'link' => '/comments/edit/:id',
            'class' => 'comment'
        ),
        'Message' => array(
            'name' => __('Message', true),
            'link' => '/messages/view/:id',
            'class' => 'message'
        ),
        'Asset' => array(
            'name' => __('File', true),
            'link' => '/assets/edit/:id',
            'class' => 'file'
        ),
    );
?>
<div class="recently_changed">
<?php if (empty($items)): ?>
    <p><?php __('Nothing happened yet.'); ?></p>;
<?php else: ?>
    <table class="data" cellspacing="0">
		<caption>
			<p><?php __('Recently added or changed content:'); ?> 2010-02-23 to 2010-02-23</p>
		</caption>
        <tbody>
			<?php
			$i = 0;
			foreach ($items as $item):
				$class = null;
				if ($i++ % 2 == 0) {
					$class = ' altrow';
				}
			
			?>
            <tr class="<?php echo $labels[$item['class']]['class'], $class; ?>">
                <th><span><?php echo $labels[$item['class']]['name']; ?></span></th>
                <td>
                <?php 
                    $label = empty($item['item']['title']) ? '<em>untitled</em>' : hsc($item['item']['title']);
                    $url = '/' . Configure::read('Routing.admin') . '/' . r(':id', $item['item']['id'], $labels[$item['class']]['link']);
					$viewUrl = '';

                    switch ($item['class'])	{
						case 'Comment':
							$url = array('controller' => 'comments', 'action' => 'index', '#comment-' . $item['item']['id']);
						break;
						case 'Post':
							$viewUrl = '/' . Configure::read('Wildflower.postsParent') . '/' . $item['item']['slug'];
							$viewUrl = '&nbsp;' . $html->link('view', $viewUrl, array('escape' => false));
						break;
						case 'Asset':
							$viewUrl = '/' . Configure::read('Wildflower.mediaRoute') . '/' . $item['item']['name'];
							$viewUrl = '&nbsp;' . $html->link('view', $viewUrl, array('escape' => false));
						break;
						case 'Page':
							$viewUrl = '/' . $item['item']['url'];
							$viewUrl = '&nbsp;' . $html->link('view', $viewUrl, array('escape' => false));
						break;
                    }

                    echo
						$html->link($label, $url, array('escape' => false)), 
						$viewUrl;
                ?>
                </td>
                <td class="date"><?php echo $time->niceShort($item['item']['updated']); ?></td>
			</tr>
            <?php endforeach; ?>
        </tbody>
    </table>
<?php endif; ?>
</div>

<?php $partialLayout->blockStart('sidebar'); ?>
    <li>
        <?php
            echo
            $form->create('Dashboard', array('url' => $html->url(array('action' => 'admin_search', 'base' => false)), 'class' => 'search')),
            $form->input('query', array('label' => __('Find a page or post by typing', true), 'id' => 'SearchQuery')),
            $form->end();
        ?>
    </li>
    <li class="editHome">
		<strong>Edit Home Page <?php echo $htmla->link('Home Page', array('controller' => 'pages', 'action' => 'edit', 'id' => Configure::read('AppSettings.home_page_id')), array('strict' => true)); ?></strong>
    </li>
    <li class="main_sidebar category_sidebar">
        <h4 class="sidebar_heading">User activity</h4>
        <ul>
        <?php foreach ($users as $user): ?>
            <?php
                $userText = __(' logged in ', true) . $time->niceShort($user['User']['last_login']);
                if (empty($user['User']['last_login'])) {
                    $userText = __(' not seen recently.', true);
                }
            ?>
            <li><?php echo $user['User']['name'], $userText; ?></li>
        <?php endforeach; ?>
        </ul>
    </li>
    <li class="main_sidebar tag_cloud">
		<?php
			echo $this->element('admin_tag_cloud');
		?>
    </li>
<?php $partialLayout->blockEnd(); ?>
