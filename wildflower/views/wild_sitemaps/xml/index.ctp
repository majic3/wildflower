<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc><?php echo Router::url('/',true); ?></loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <!-- static pages -->    
    <?php foreach ($pages as $page):?>
    <url>
        <loc><?php echo Router::url('/'.$page['WildPage']['url'],true); ?></loc>
        <lastmod><?php echo $time->toAtom($page['WildPage']['updated']); ?></lastmod>
        <priority>0.8</priority>
    </url>
    <?php endforeach; ?>
    <!-- posts-->    
    <?php foreach ($posts as $post):?>
    <url>
        <loc><?php echo Router::url('/'. Configure::read('Wildflower.postsParent') . '/' . $post['WildPost']['uuid']); ?></loc>
        <lastmod><?php echo $time->toAtom($post['WildPost']['updated']); ?></lastmod>
        <priority>0.8</priority>
    </url>
    <?php endforeach; ?>
</urlset>