$(document).ready(function() {
	$('.wysiwyg').each(function() {
		// Handle textarea
		var editor = $(this);
		var command = null;
		
		// Create iframe
		iframe = document.createElement('iframe');
		iframe.className = 'wysiwyg-editor';
		
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
		
		// Create array of tools
		var toolbar = ['bold', 'italic', 'underline', 'strikethrough', 'insertorderedlist', 'insertunorderedlist', 'justifyleft', 'justifycenter', 'justifyright', 'justifyfull', 'subscript', 'superscript', 'createlink', 'unlink'];
		
		// Create toolbar buttons
		$('<li id="wysiwyg-bold" class="left" unselectable="on">setBold</li>').appendTo('.wysiwyg-toolbar');
		$('<li id="wysiwyg-italic" class="middle" unselectable="on">setItalic</li>').appendTo('.wysiwyg-toolbar');
		$('<li id="wysiwyg-underline" class="middle" unselectable="on">underLine</i></li>').appendTo('.wysiwyg-toolbar');
		$('<li id="wysiwyg-strikethrough" class="right" unselectable="on">strikeThrough</i></li>').appendTo('.wysiwyg-toolbar');
		$('<li id="wysiwyg-insertorderedlist" class="left" unselectable="on">orderedList</i></li>').appendTo('.wysiwyg-toolbar');
		$('<li id="wysiwyg-insertunorderedlist" class="right" unselectable="on">unorderedList</li>').appendTo('.wysiwyg-toolbar');
		$('<li id="wysiwyg-justifyleft" class="left" unselectable="on">textLeft</li>').appendTo('.wysiwyg-toolbar');
		$('<li id="wysiwyg-justifycenter" class="middle" unselectable="on">textCenter</li>').appendTo('.wysiwyg-toolbar');
		$('<li id="wysiwyg-justifyright" class="middle" unselectable="on">textRight</li>').appendTo('.wysiwyg-toolbar');
		$('<li id="wysiwyg-justifyfull" class="right" unselectable="on">textJustify</li>').appendTo('.wysiwyg-toolbar');
		$('<li id="wysiwyg-subscript" class="left" unselectable="on">subScript</li>').appendTo('.wysiwyg-toolbar');
		$('<li id="wysiwyg-superscript" class="right" unselectable="on">superScript</li>').appendTo('.wysiwyg-toolbar');
		$('<li id="wysiwyg-createlink" class="left" unselectable="on">createLink</li>').appendTo('.wysiwyg-toolbar');
		$('<li id="wysiwyg-unlink" class="right" unselectable="on">unLink</li>').appendTo('.wysiwyg-toolbar');
		
		/**
		 * Toolbar button events 
		 */
		$('.wysiwyg-toolbar li').on('click', function() {
			// Get command name
			commandName = $(this).attr('id').substring(8);
			
			// Set start command
			iframe.contentWindow.focus();
			
			if(commandName == 'createlink') {
				link = createLink();
				
				url = prompt('URL address', link);
				
				if(link != url) {
					before = $('.wysiwyg-editor').contents().find('body').html();
					
					// Bug: IE and Opera change full link
					iframe.contentWindow.document.execCommand(commandName, false, url);
					
					after = $('.wysiwyg-editor').contents().find('body').html();
					
					if(before == after && url !== '' && getSelected(true) !== '') {
						// Firefox: Insert link inside other link
						iframe.contentWindow.document.execCommand('insertHTML', false, '<a href="'+ url +'">'+ getSelected(true) +'</a>');
					}
				}
			} else {
				iframe.contentWindow.document.execCommand(commandName, false, null);
			}
			
			// Set end command
			iframe.contentWindow.focus();
		});
		
		/**
		 * Live normalize code 
		 */
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
			
			// Replace and normalize alignments
			content = content.replace(/(align="(.+)")/ig, 'style="text-align: $2;"');
			
			$('#show').html(content);
			$('textarea').val(content);
		}, 250);
		
		// Show activate toolbars
		$(iframe.contentWindow).on('click', function() {
			for(var i = 0; i < toolbar.length; i++) {
				if(iframe.contentWindow.document.queryCommandState(toolbar[i]) == true) {
					$('#wysiwyg-'+ toolbar[i]).css({
						'background': '#f2f2f2',
						'color': '#000000'
					});
				} else {
					$('#wysiwyg-'+ toolbar[i]).css({
						'background': '#ffffff',
						'color': '#707070'
					});
				}
			}
		});
		
		/**
		 * Get selection text or HTML code
		 * 
		 * @param boolean code If true then show HTML code
		 * @return string|null 
		 */
		function getSelected(code) {
			var range = iframe.contentWindow.document.getSelection();
			
			if(range) {
				if(range.getRangeAt) {
					range = range.getRangeAt(0);
				} else if(range.setStart) {
					range.setStart(range.anchorNode, range.anchorOffset);
					range.setEnd(range.focusNode, range.focusOffset);
				}
				
				var html = null;
				
				if(range.cloneContents) {
					var tmp = $('<div></div>');
					tmp.append(range.cloneContents());
					
					if(code === true) {
						return tmp.html();
					} else {
						return tmp.text();
					}
				}
			}
			
			return null;
		}
		
		/**
		 * Create, check and return URL
		 * 
		 * @return string|null 
		 */
		function createLink() {
			var pattern = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/ig;
			var search = getSelected(true).match(pattern);
			
			if(search !== null && search.length == 1) {
				return search[0];
			} else {
				var check = iframe.contentWindow.document.getSelection().focusNode.parentNode.toString().match(pattern);
 
				if(check !== null && check.length == 1) {
					if(search instanceof Array) {
						return 'A'+ null;
					} else {						
						return check;
					}
				} else {
					return '';
				}
			}
		}
	});
});

// Works good on: Chrome 29; Firefox 23; IE 10; Opera 12.15; Opera Next 15 and Safari 5.1.7.