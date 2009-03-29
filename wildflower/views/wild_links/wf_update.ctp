<?php ob_start(); ?>
<?php echo $html->link(FULL_BASE_URL . $this->base . $link['WildLink']['name'], $link['WildLink']['url']); ?> has been updated.
<?php $info = ob_get_clean(); ?>

<?php
$json = array(
    'link-info' => $info,
    'edit-buttons' => $this->element('wf_edit_buttons', array()),
);

echo json_encode($json);
?>