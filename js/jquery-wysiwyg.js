$(document).ready(function() {
	$('.wysiwyg').each(function() {
		// Handle textarea
		var editor = $(this);
		var command = null;

		// Create iframe
		iframe = document.createElement('iframe');
		iframe.className = 'wysiwyg-editor'

		// Display iframe and hide editor
		editor.after(iframe);
		editor.attr('disabled', 'disabled');
		//editor.hide();

		// Create template
		var template = '<html><head><link rel="stylesheet" type="text/css" href="css/styles-wysiwyg.css" /></head><body class="wysiwyg-content">' + editor.val() + '</body></html>';

		try {
			iframe.contentWindow.document.open();
			iframe.contentWindow.document.write(template);
			iframe.contentWindow.document.close();
		} catch(error) {
			console.log(error);
		}

		if(document.contentEditable || document.designMode != null) {
			iframe.contentWindow.document.designMode = 'on';
		} else {
			// Cannot switch WYSIWYG mode
		}

		// Set shorter tags (HTML above CSS for eg. Firefox)		
		try {
			iframe.execCommand('styleWithCSS', false, false);
		} catch(e) {
			try {
				iframe.execCommand('useCSS', false, null);
			} catch(e) {
				try {
					iframe.execCommand('styleWithCSS', false, false);
				} catch(e) {
				}
			}
		}

		// Create toolbar
		$('.wysiwyg-editor').before('<h1>PUBLISHER</h1><ul class="wysiwyg-toolbar"></ul>');

		// Create toolbar buttons
		$('<li id="wysiwyg-bold" class="left" unselectable="on">bold</li>').appendTo('.wysiwyg-toolbar');
		$('<li id="wysiwyg-italic" class="middle" unselectable="on">italic</li>').appendTo('.wysiwyg-toolbar');
		$('<li id="wysiwyg-underline" class="middle" unselectable="on">underline</i></li>').appendTo('.wysiwyg-toolbar');
		$('<li id="wysiwyg-strikethrough" class="right" unselectable="on">strike</i></li>').appendTo('.wysiwyg-toolbar');
		$('<li id="wysiwyg-insertorderedlist" class="left" unselectable="on">ordered list</i></li>').appendTo('.wysiwyg-toolbar');
		$('<li id="wysiwyg-insertunorderedlist" class="right" unselectable="on">unordered list</li>').appendTo('.wysiwyg-toolbar');
		$('<li id="wysiwyg-justifyleft" class="left" unselectable="on">text-left</li>').appendTo('.wysiwyg-toolbar');
		$('<li id="wysiwyg-justifycenter" class="middle" unselectable="on">text-center</li>').appendTo('.wysiwyg-toolbar');
		$('<li id="wysiwyg-justifyright" class="middle" unselectable="on">text-right</li>').appendTo('.wysiwyg-toolbar');
		$('<li id="wysiwyg-justifyfull" class="right" unselectable="on">text-justify</li>').appendTo('.wysiwyg-toolbar');
		$('<li id="wysiwyg-subscript" class="left" unselectable="on">subScript</li>').appendTo('.wysiwyg-toolbar');
		$('<li id="wysiwyg-superscript" class="right" unselectable="on">superScript</li>').appendTo('.wysiwyg-toolbar');
		
		// Toolbar button events
		$('.wysiwyg-toolbar li').click(function(e) {
			// Get command name
			commandName = $(this).attr('id').substring(8);

			// Set command
			iframe.contentWindow.focus();
			iframe.contentWindow.document.execCommand(commandName, false, null);
			iframe.contentWindow.focus();
		});

		// Live update form
		setInterval(function() {
			var content = $('.wysiwyg-editor').contents().find('body').html();
			
			// Replace html tags from uppercase to lowercase
			content = content.replace(/<\/?([A-Z])+.*?>/g, function(tag) {
				return tag.toLowerCase();
			});
			
			// Replace new lines
			content = content.replace(/<br>/g, '<br />\n');
			
			// Replace paragraphs
			content = content.replace(/(<\/p[^<]*?>)/ig, '$1\n');
			
			// Normalize tags (strong to b, em to i)
			content = content.replace(/(<(\/)*strong>)/ig, '<$2b>');
			content = content.replace(/(<(\/)*em>)/ig, '<$2i>');
			
			// Replace alignments
			content = content.replace(/(align="(.+)")/ig, 'style="text-align: $2;"');

			$('#show').html(content);
			$('textarea').val(content);
		}, 250);
	});
});

// Tested on: Chrome 27; Firefox ; Internet Explorer; Opera; Opera Next; Safari;