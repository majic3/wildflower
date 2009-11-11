
var loaderImage = new Image();
loaderImage.src = '/img/loader.gif';

$(document).ready(function(){
	var messageArea = $('#WildCommentContent', '#PostAComment');
	var nameInput = $('#WildCommentName', '#PostAComment');
	var emailInput = $('#WildCommentEmail', '#PostAComment');
	var urlInput = $('#WildCommentUrl', '#PostAComment');
	messageArea.click(function (){
		$(this).unbind('click').click(function(){
			return false;
		});
	});

	$('input[type=submit]', '#PostAComment').click(function(){
		// Store vars
		var name = nameInput.hide().val();
		var email = emailInput.hide().val();
		var url = urlInput.hide().val();
		var message = messageArea.hide().val();
		var $this = $(this);
		// Validation
		if(message.length < 1 || message == "Leave your message here..."){
			messageArea.fadeOut('slow', function(){
				var errorMessage = 'Oops! You haven&#8217;t typed anything. Please have another go...';
				var error = $('<div id="too-short"><span class="error">' + errorMessage + '</span></div>').insertBefore($(this));
				error.hide().fadeIn('slow', function(){
					setTimeout(function(){
						error.hide();
						messageArea.fadeIn('slow');
					}, 2000);
				});
			});
			return false;
		}

		var dataString = 'name='+name+'&email='+email+'&url='+url+'&content='+ message;
		var postUrl = $('#PostAComment').attr('action');

		// Show loader
		var loader = $('<div id="loader"><img class="load-gif" src="' + loaderImage.src + '" /></div>').insertBefore('#PostAComment');

		//alert (dataString);
		$.ajax({
			type: "POST",
			url: postUrl,
			data: dataString,
			success: function(data) {
				$('#loader').find('img.load-gif').remove();
				$('#loader').append('<p class="notice success">Thanks for your comment!</p>');
				$('#loader').hide().fadeIn('slow');
				$('span.limit').remove();
				$('#comments').prepend(data);
				$('#comments div.comment-unapproved:nth-child(1)').hide().slideDown('slow');
				$this.unbind('click').hide().click(function(){
					return false;
				});
			}
		});
		return false;
	});
	messageArea.keyup(function(){
		var limit = 140;
		var currentLength = $(this).val().length;
		var charsLeft = limit - currentLength;
		$('span.limit').html(charsLeft);
		if(currentLength >= limit){
			$(this).val($(this).val().substring(0, limit));
			$('span.limit').html('0');
			var textarea = document.getElementById('message');
			textarea.scrollTop = textarea.scrollHeight + 9999;
		}
	});
});
