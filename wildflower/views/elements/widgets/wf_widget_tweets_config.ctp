<h2 class="section">Editing a widget</h2>

<?php
    echo $form->create('WildWidget', array('url' => '/' . Configure::read('Wildflower.prefix') . '/widgets/update', 'id' => 'edit_widget_form'));
    
    if (!isset($this->data['WildWidget']['items']) or empty($this->data['WildWidget']['items'])) {
        echo '<div class="twitter_block">';
        echo '<h3>Cell 1</h3>';
        echo $form->input("WildWidget.items.0.label", array('type' => 'text', 'label' => 'Label'));
        echo $form->input("WildWidget.items.0.url", array('type' => 'text', 'label' => 'URL'));
        echo '</div>';
    } else {
        foreach ($this->data['WildWidget']['items'] as $i => $item) {
            if ($i == 'id') {
            }
            echo '<div class="twitter_block">';
            echo '<h3>Cell ', $i + 1, '</h3>';
            echo $form->input("WildWidget.items.$i.label", array('type' => 'text', 'label' => 'Label'));
            echo $form->input("WildWidget.items.$i.url", array('type' => 'text', 'label' => 'URL'));
            echo '</div>';
        }
    }

    if (!isset($this->data['WildWidget']['settings']) or empty($this->data['WildWidget']['settings'])) {
        echo '<div class="twitter_block">';
        echo '<h3>Cell 1</h3>';
        echo $form->input("WildWidget.settings.0.limitKey", array('type' => 'text', 'label' => 'limitKey'));
        echo $form->input("WildWidget.settings.0.limitValue", array('type' => 'text', 'label' => 'limitValue'));
        echo '</div>';
    } else {
        foreach ($this->data['WildWidget']['settings'] as $i => $item) {
            if ($i == 'id') {
            }
            echo '<div class="twitter_block">';
            echo '<h3>Cell ', $i + 1, '</h3>';
            echo $form->input("WildWidget.settings.$i.limitKey", array('type' => 'text', 'label' => 'limitKey'));
            echo $form->input("WildWidget.settings.$i.limitValue", array('type' => 'text', 'label' => 'limitLabel'));
            echo '</div>';
        }
    }
    
    echo $form->input('style', array('type' => 'text', 'label' => 'complex|pop|f'));
    echo $form->input('head', array('type' => 'text', 'label' => 'head string or f'));
    echo $form->input('foot', array('type' => 'text', 'label' => 'foot t or f'));
    echo $form->hidden('twitterUrl', array('type' => 'hidden'));
    echo $form->hidden('tweets', array('type' => 'hidden'));
    
    echo '<p>', $html->link('Add new cell', '#AddNewCell', array('id' => 'AddNewCell')), '</p>';

    echo $form->hidden('id');
    echo $form->end(__('Save', true));
?>
<div class="cancel-edit"> <?php __('or'); ?> <?php echo $html->link(__('Cancel', true), '#CancelWidgetEdit', array('id' => 'CancelWidgetEdit')); ?></div>