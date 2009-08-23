<?php 
if ($isLogged) {
    echo '<div class="adm-link"><p>',
         $html->link('Site admin', '/' . Configure::read('Routing.admin')),
         '</p></div>';	
}
?>