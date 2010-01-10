$.jlm.bind('pages.admin_edit', function() {
   
   $('textarea:first').focus();
   
   var origText = $('a[href=#ShowSidebarEditor]').text();
   $('a[href=#ShowSidebarEditor]').toggle(function() {
       $('.sidebar_editor').slideDown(500, function() {
           $('.sidebar_editor textarea').focus();
       });
       $(this).text('<l18n>Hide sidebar editor</l18n>');
       return false;
   }, function() {
       $('.sidebar_editor').hide();
       $(this).text(origText);
       return false;
   });
	console.info('just edit jumpMenu should trigger');
});

$.jlm.bind('pages.admin_edit, pages.admin_options, pages.admin_sidebar, posts.admin_edit, posts.admin_options, posts.admin_categorize, posts.admin_comments, posts.admin_sidebar', function() {
    $.jlm.components.jumpMenu.startup();
});



$.jlm.bind('sidebars.admin_edit', function() {
    
});
