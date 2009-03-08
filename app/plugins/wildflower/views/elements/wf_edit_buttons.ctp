<div class="submit" id="save-draft">
    <input type="submit" value="<?php echo hsc(__('Save as the newest version', true)); ?>" />
</div>

<div class="buttons"> <?php __('or'); ?> <?php echo $html->link(__('Cancel', true), array('action' => 'view', (isset($this->data['WildPost'])) ? $this->data['WildPost']['id'] : $this->data['WildPage']['id'])); ?></div>
