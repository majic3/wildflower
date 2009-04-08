<?php ob_start(); ?>
This Example was saved <?php echo $time->nice($example['Example']['updated']); ?>
<?php $info = ob_get_clean(); ?>

<?php
$json = array(
    'post-info' => $info,
    'edit-buttons' => null,
);

echo json_encode($json);
?>