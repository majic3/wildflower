<div class="submit" id="save-draft">
    <input type="submit" value="<?php echo hsc(__('Save as the newest version', true)); ?>" />
</div>

<<<<<<< HEAD:app/plugins/wildflower/views/elements/wf_edit_buttons.ctp
<div class="buttons"> <?php /* __('or'); */ ?> <?php /* echo $html->link(__('Cancel', true), array('action' => 'view', (isset($this->data['WildPost'])) ? $this->data['WildPost']['id'] : $this->data['WildPage']['id'])); */ ?></div>	  

<?php endif; ?>
=======
<div class="cancel-edit"> <?php __('or'); ?> <?php echo $html->link(__('Cancel', true), array('action' => 'view', (isset($this->data['WildPost'])) ? $this->data['WildPost']['id'] : $this->data['WildPage']['id'])); ?></div>
>>>>>>> master:app/plugins/wildflower/views/elements/wf_edit_buttons.ctp
