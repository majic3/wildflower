<li class="insert_block">
    <h4>Insert a block</h4>
    <p>Blocks can be used in pages &amp; sidebars not in widgets (widgets can be used in blocks); Using Blocks means content will not be cached in the static cache dir in webroot. And will use the cake cache system if set in cake &amp; enabled in wf settings.  Blocks are displayed live in your MCE.  Blocks use the class name block to restrict editing of content</p>

    <ul class="block_list">
        <?php foreach ($blocks as $block): ?>
            <li><a href="#Insert<?php echo hsc($blocks['href']); ?>" rel="<?php echo hsc($block['id']); ?>">insert</a> / <a href="#Preview<?php echo hsc($blocks['href']); ?>" rel="<?php echo hsc($block['id']); ?>">preview</a></li>
        <?php endforeach; ?>
    </ul>
</li>
