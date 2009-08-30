<?php if (isset($countries) and !empty($countries)) :  ?>
<rsp stat="ok">
<countries type='array'>
    <?php foreach ($countries as $country) : ?>
        <country type='struct'>
            <id><?php e($country['Country']['id'])?></id>
            <title><?php e($country['Country']['title'])?></title>
        </country>
    <?php endforeach; ?>
</countries>
<?php else: ?>
<rsp stat="fail">
    <err type='struct'>
    <?php if ($session->check('Message.flash')): ?>
        <msg><?php e(strip_tags($session->read('Message.flash')));?></msg>
    <?php endif; ?>
    </err>
<?php endif; ?>
</rsp>