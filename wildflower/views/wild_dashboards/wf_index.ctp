<?php
/* todo: fix up quick post, fix messages error */


    $labels = array(
        'WildPage' => array(
            'name' => __('Page', true),
            'link' => '/pages/edit/:id',
            'class' => 'page'
        ), 
        'WildPost' => array(
            'name' => __('Post', true),
            'link' => '/posts/edit/:id',
            'class' => 'post'
        ),
        'WildComment' => array(
            'name' => __('Comment', true),
            'link' => '/comments/edit/:id',
            'class' => 'comment'
        ),
        'WildMessage' => array(
            'name' => __('Message', true),
            'link' => '/messages/view/:id',
            'class' => 'message'
        ),
        'WildAsset' => array(
            'name' => __('File', true),
            'link' => '/assets/edit/:id',
            'class' => 'file'
        ),
    );

?><h2 class="section">Welcome to <?php echo $siteName ?> administration</h2>

<p><?php __('Recently added or changed content:'); ?></p>

<!-- <<<<<< HEAD:wildflower/views/wild_dashboards/wf_index.ctp -->
<div class="wrapper">
	<?php foreach ($dashClasses as $name => $class): ?>
		<h3><?php	echo ($name)	?></h3>
		<div id="dash<?php echo $name; ?>" class="tabs">
			<?php

			$nav = array();
			switch($name)	{
				case 'WildMessage':
					$nav[] = array('display' => 'new messages', 'class' => 'messages', 'url' => '#messagesNewTab', 'attribs' => array());
					$labelField = 'name';
					$tabTitle = 'Messages';
				break;
				case 'WildPage':
					$nav[] = array('display' => 'recent pages', 'class' => 'recent', 'url' => '#pagesRecentTab', 'attribs' => array());
					$nav[] = array('display' => 'draft pages', 'class' => 'draft', 'url' => '#pagesDraftsTab', 'attribs' => array());
					$labelField = 'title'; 
					$tabTitle = 'Pages';
				break;
				case 'WildPost':
					$nav[] = array('display' => 'recent posts', 'class' => 'recent', 'url' => '#postsRecentTab', 'attribs' => array());
					$nav[] = array('display' => 'unpublished posts', 'class' => 'draft', 'url' => '#postsUnpublishedTab', 'attribs' => array());
					$nav[] = array('display' => 'quick post', 'class' => 'form', 'url' => '#quickPostTab', 'attribs' => array());
					$labelField = 'title';
					$tabTitle = Configure::read('Wildflower.blogName') . ' entries';
				break;
				case 'WildAsset':
					$nav[] = array('display' => 'images', 'class' => 'images', 'url' => '#assetsImagesTab', 'attribs' => array());
					$nav[] = array('display' => 'other', 'class' => 'misc', 'url' => '#assetsOtherTab', 'attribs' => array());
					$labelField = 'name';
					$tabTitle = 'Assets';
				break;
				case 'WildComment':
					$nav[] = array('display' => 'unapproved comments', 'class' => 'unapproved', 'url' => '#commentsUnapprovedTab', 'attribs' => array());
					$nav[] = array('display' => 'possible spam', 'class' => 'spam', 'url' => '#commentsSpamTab', 'attribs' => array());
					$labelField = 'Comments';
					$tabTitle = 'Comments';
				break;
			}

			echo $navigation->tabslist($nav, false);

			foreach ($nav as $tab)://debug($tab); die();
			?><div id="<?php echo str_replace('#', '', $tab['url']); ?>">
				<?php if($tab['class'] == 'form'):
					//	echo $this->element('');
					else: ?>
				<ul><?php
					foreach ($dashItems[$name] as $item): ?>
					<li>
						<?php 
							$label = empty($item[$name][$labelField]) ? '<em>untitled</em>' : hsc($item[$name][$labelField]);
							$url = '/' . Configure::read('Wildflower.prefix') . '/' . r(':id', $item[$name]['id'], $labels[$name]['link']);
							if($name == 'WildComment')	{		 
								if($item[$name]['spam'] && ($tab['class'] == 'spam'))	{
									echo '<p class="comment spam">', $html->link($label, $url, array('escape' => false)) , ' <span>', $time->niceShort($item[$name]['updated']), '</span></p>'; 
								} elseif(!$item[$name]['unapproved'] && ($tab['class'] !== 'unapproved'))	{
									echo '<p class="comment unapproved">', $html->link($label, $url, array('escape' => false)) , ' <span>', $time->niceShort($item[$name]['updated']), '</span></p>';
								}
							} else if($name == 'WildMessage')	{
								if($item[$name]['spam'] && ($tab['class'] == 'spam'))	{
									echo '<p class="msg spam">', $item[$name]['subject'], $html->link($label, $url, array('escape' => false)) , ' <span>', $time->niceShort($item[$name]['updated']), '</span></p>'; 
								} else if(!$item[$name]['spam'] && ($tab['class'] !== 'spam'))	{
									echo '<p class="msg">', $item[$name]['subject'], ' ', $html->link($label, $url, array('escape' => false)) , ' <span>', $time->niceShort($item[$name]['updated']), '</span></p>'; 
								}
							} else {
								if($item[$name]['draft'] && ($tab['class'] == 'draft'))	{
									echo '<p class="draft">', $html->link($label, $url, array('escape' => false)) , ' <span>', $time->niceShort($item[$name]['updated']), '</span></p>'; 
								} else if(!$item[$name]['draft'] && ($tab['class'] !== 'draft'))	{
									echo '<p class="published">', $html->link($label, $url, array('escape' => false)) , ' <span>', $time->niceShort($item[$name]['updated']), '</span></p>';
								}
							}
						?>
					</li>
					<?php endforeach; #dashItems ?>
				</ul>
			<?php endif; # tab[class] ?>
		</div>
		<?php endforeach; # $nav	?>
	</div>
<?php endforeach; # $dashClasses	?>

	<div id="dashFeeds" class="wrapper"> 
		<?php	foreach (Configure::read('Icing.dashboardFeeds') as $feed): echo ($html->link($feed['name'], 'http://' . $feed['url'], Array('class' => 'feed'))); endforeach;	?>
	</div>

	<!-- div id="dashStats" class="wrapper">
		<div id="hitsThisWeek"></div>
		<div id="searchAndRefers"></div>
		<div id="pieBrowsers"></div>
		<div id="pieDiskSpace"></div>
		<?php	echo ($html->link('more data', '/wf/stats/'));	?>
	</div -->
</div>
<?php $partialLayout->blockStart('sidebar'); ?>
    <li>
        <?php
            echo
            $form->create('WildDashboard', array('url' => $html->url(array('action' => 'wf_search', 'base' => false)), 'class' => 'search')),
            $form->input('query', array('label' => __('Find a page or post by typing', true), 'id' => 'SearchQuery')),
            $form->end();
        ?>
    </li>
<?php $partialLayout->blockEnd(); ?>
