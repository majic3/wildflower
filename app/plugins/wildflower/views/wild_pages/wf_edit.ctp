<?php 
    $partialLayout->switchToEditorMode();
    $partialLayout->setLayoutVar('publishedLink', $html->link(FULL_BASE_URL . $this->base . $this->data['WildPage']['url'], $this->data['WildPage']['url']));
    $session->flash();
    
    echo 
    $form->create('WildPage', array('url' => $html->url(array('action' => 'wf_update', 'base' => false)), 'class' => 'editor_form'));
?>

<?php /* 
<ul id="page_inserts">
    <li><span>Insert into page: </span></li>
    <li><a href="#InsertLink">Link</a></li>
    <li><a href="#InsertImage">Image or file</a></li>
</ul>
*/?>

<?php
    echo
    $form->input('title', array('between' => '', 'label' => 'Page title')), 
    $form->input('content', array(
        'type' => 'textarea',
		'class' => 'tinymce',
        'rows' => 25,
        'cols' => 60,
        'label' => 'Body',
        'div' => array('class' => 'input editor'))),
    $form->input('sidebar_content', array(
        'type' => 'textarea',
		'class' => 'tinymce',
        'rows' => 25,
        'cols' => 60,
        'label' => 'Sidebar',
        'div' => array('class' => 'input sidebar_editor'))),
    '<div>',
    $form->hidden('id'),
    $form->hidden('draft'),
    '</div>';
?>

<div id="edit-buttons">
    <?php echo $this->element('wf_edit_buttons'); ?>
</div>

<?php 
    echo 
    
    // Options for create new JS
	$form->input('parent_id_options', array('type' => 'select', 'options' => $newParentPageOptions, 'empty' => '(none)', 'div' => array('class' => 'all-page-parents input select'), 'label' => __('Parent page', true), 'escape' => false)),
	
	$form->end();
?>

<span class="cleaner"></span>

<?php $partialLayout->blockStart('sidebar'); ?>
    <li class="main_sidebar">
        <?php echo $html->link(
            '<span>Create a new page</span>', 
            array('action' => 'wf_create'),
            array('class' => 'add', 'escape' => false)); ?>
    </li>
    <li class="main_sidebar">
        <ul class="sidebar-menu-alt edit-sections-menu">
            <li><?php echo $html->link('Options <small>like status, publish date, etc.</small>', array('action' => 'options', $this->data['WildPage']['id']), array('escape' => false)); ?></li>
            <li><a href="#ShowSidebarEditor">Show sidebar editor</a></li>
            <li><?php echo $html->link('Browse older versions', array('action' => 'versions', $this->data['WildPage']['id'])); ?></li>
        </ul>
    </li>
    <li class="sidebar-box post-info main_sidebar">
        <?php echo $this->element('../wild_pages/_page_info'); ?>
    </li>
    <li class="versions main_sidebar">
        <h4>Versions</h4>
        <ul>
        <?php
            $attr = array();
            foreach ($revisions as $version) {
                if (isset($this->params['named']['rev']) and $this->params['named']['rev'] == $version['WildRevision']['revision_number']) {
                    $attr['class'] = 'current';
                }
                echo '<li>', $html->link($time->niceShort($version['WildRevision']['created']), "/{$this->params['prefix']}/pages/edit/{$this->data['WildPage']['id']}/rev:{$version['WildRevision']['revision_number']}", $attr), '</li>';
                $attr['class'] = '';
            }
        ?>
        </ul>
    </li>
<?php $partialLayout->blockEnd(); ?>
