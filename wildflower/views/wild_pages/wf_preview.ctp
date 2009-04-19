<h2 class="section"><?php echo hsc($page['WildPage']['title']), ' ', __('preview', true); ?></h2>

<iframe id="preview_frame" src="<?php echo $html->url($page['WildPage']['url']); ?>" height="700" frameborder="0">
    <p>Your browser does not support iframes.</p>
</iframe>

<div class="submit" id="close_preview">
    <input type="submit" value="<?php __('Edit'); ?>" name="ClosePreview" />
</div>

<?php $partialLayout->blockStart('sidebar'); ?>
    <li></li>
<?php $partialLayout->blockEnd(); ?>