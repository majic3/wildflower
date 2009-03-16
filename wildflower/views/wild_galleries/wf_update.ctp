<?php ob_start(); ?>
This gallery is <?php if ($this->data['WildGallery']['draft']): ?>not published, therefore not visible to the public<?php else: ?>published and visible to the public at <?php echo $html->link(FULL_BASE_URL . $this->base . WildGallery::getUrl($this->data['WildGallery']['gallery']), WildGallery::getUrl($this->data['WildGallery']['slug'])); ?><?php endif; ?>. Latest changes were made <?php echo $time->nice($this->data['WildGallery']['updated']); ?>.
<?php $info = ob_get_clean(); ?>

<?php
$json = array(
    'post-info' => $info,
    'edit-buttons' => $this->element('wf_edit_buttons', array('isDraft' => $post['WildPost']['draft'])),
);

echo json_encode($json);
?>