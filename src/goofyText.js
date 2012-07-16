;(function(){

	// Support methods...

	/**
	 * private method on
	 * enables events, intended for DOM objects.	 
	 */
	function on(evtName, callBack){

		if (this.addEventListener){
			return this.addEventListener(evtName, callBack)

		} else if (this.attachEvent){
			return this.attachEvent('on'+evtName, callBack)

		} else {
			throw "Unable to attach event."
		}
	}

	/**
	 * private method off
	 * disables events, intended for DOM objects.
	 */
	function off(evtName, callBack){
		if (this.removeEventListener){
			return this.removeEventListener(evtName, callBack)

		} else if (this.detachEvent){
			return this.detachEvent('on'+evtName, callBack)

		} else {
			throw "Unable to attach event."
		}
	}

	/**
	 * Cross platform, detection of cursor location relative to scrollable parents.
	 * if not visibile by user, scroll into view.
	 */
	 // FIXME: This needs some TLC... it doesn't work.
	function scrollIntoViewIfNeeded (node){

		if (node.scrollIntoViewIfNeeded) return node.scrollIntoViewIfNeeded();

		// FIXME: Awful awful in IE, Firefox, bleah
		return;
		//return node.scrollIntoView();
	}


	/**
	 * Creates a char element 
	 */
	function mkCharNode (character){
		var chrNode = document.createElement('span')

		if ( character ==='\n' ) {
			chrNode.innerHTML = "\n<br />";
			chrNode.isNewLine = true;

		} else if (character===' ') {
			chrNode.innerHTML = "<span style='display:inline-block'>&nbsp;</span>";

		} else {
			if (chrNode.textContent!==undefined){
				chrNode.textContent = character;
			} else {
				chrNode.innerText = character;
			}
			
		}

		// It Might makes sense to refactor this.  if we start calling .click() at any point.
		on.call(chrNode, 'click', function(){
			console.log("Char click");
			cursor.target(chrNode);
			cursor.cycle(true);
			scrollIntoViewIfNeeded(chrNode);
		});

		return chrNode;
	}

	/**
	 * getOriginalContent yanks all the text out of something
	 */
	function getOriginalContent(node){

		var placeHolder	= document.createElement('div');
		var throwAway 	= document.createElement('div');
		var chr 		= null;

		while (node.childNodes.length){
			var cNode = node.childNodes[0];

			if (!cNode) return false;
			
			if (cNode.nodeType===3){
				// It's a text el, break it up int chrs
				for (var i=0; i<cNode.length; ++i){

					if (cNode.textContent){
						chr = mkCharNode(cNode.textContent[i]);

					} else if (cNode.nodeValue){
						chr = mkCharNode(cNode.nodeValue.charAt(i));

					} else {
						throw "What am I supposed to do?"
					}

					placeHolder.appendChild(chr);

				}
				throwAway.appendChild(cNode);
			}
			else {
				placeHolder.appendChild(cNode);
			}
		}

		return placeHolder;

	}

	/**
	 * function setContent sets the content from text
	 */
	function setContent(node, content){
		if (!content) return node;

		while (content.childNodes.length){
			node.appendChild(content.childNodes[0]);
		}

		return node;

	}

	function initializeNode(node){
		if (node.goofyTextInitialized){ return; }
		node.goofyTextInitialized = true;

		var originalContent = getOriginalContent(node);
		node.innerHTML = '';
		setContent(node, originalContent);

		on.call(node, 'click', function(){
			console.log("Editable area click");
		})

		return node;
	}


	// Private Declarations...

	// Information regarding where the cursor lives
	var cursor = {
		// The actual element that blinks.
		blinker: document.createElement('span'),
		// A place to hide the blinker when nothing is selected.
		stashNode: document.createElement('div'),
		// The <TEXTAREA> that allows us to deal with input methods.
		hijacker: document.createElement('textarea'),
		// The next color of the cursor:
		nextColor: 'black',
		// timeout id
		cycleTimeout: null,
		// method to cycle the cursor.
		cycle: function(update){
			// Set the cursor color
			if (true || cursor.character){
				cursor.nextColor= update||(cursor.nextColor==='transparent')?'black':'transparent';
				cursor.blinker.style.borderRightColor =  cursor.nextColor;

				// FIXME FIXME FIXME!!!!
				// For some reason setting a background color allows the cursor to flash in IE7.
				// All other browsers are fine without this.
				cursor.blinker.style.backgroundColor = cursor.blinker.style.backgroundColor||'transparent';
				// FIXTHAT ^ 
			}

			// Clear & reset the timout
			clearTimeout(cursor.cycleTimeout);
			cursor.cycleTimeout = setTimeout( cursor.cycle, update?960:480 );
		}, 
		// Method target puts a cursor around a chrNode
		target: function(chrNode, forceLeft, forceRight){
			cursor.preventStash = true;
			if (forceRight || (chrNode.previousSibling===cursor.blinker && !forceLeft) ){
				// Put the cursor to the right of chrNode.
				chrNode.parentNode.insertBefore( cursor.blinker, chrNode.nextSibling );

			} else {
				// Put the cursor to the left of chrNode.
				chrNode.parentNode.insertBefore( cursor.blinker, chrNode );
			}
		},
		// Stashes the cursor, if allowed.
		stash: function(){
		 	if (!cursor.preventStash){
		 		cursor.stashNode.appendChild(cursor.blinker);
		 	}
		 	cursor.preventStash = false;
		},
		// isReady, whether or not the cursor is ready to handle keys
		isReady: function(){
			return (cursor.blinker.ownerCt !== cursor.stashNode);
		},
		// Handler for keydown:
		keydown: function (evt){ 
			if (!cursor.isReady()) return;
			console.log("keydown);")

			var evt = evt || window.event
			var chr = String.fromCharCode(evt.keyCode)
			
			
			switch (evt.keyCode){
				case 8: // backspace
					
					if (cursor.blinker.previousSibling){
						cursor.blinker.parentNode.removeChild(cursor.blinker.previousSibling)
					}
					
					// Stupid thing to stop the browser from going back.
					evt.keyCode = 0; // The less obvious approach
					if (evt.preventDefault) evt.preventDefault(); // the more obvious approach
					inputSuppressNextKeypress=true;
					break;

				case 9: // tab
					cursor = null;

					inputSuppressNextKeypress=true;
					break;

				case 32: // space
					// Stupid thing to stop the browser from scrolling downward.
					evt.keyCode = 0; // The less obvious approach
					if (evt.preventDefault) evt.preventDefault(); // the more obvious approach
					inputSuppressNextKeypress=false;
					cursor.keypress({keyCode: 32});
					inputSuppressNextKeypress=true;
					return false;
					break;

				case 35: // End
					var search = cursor.blinker;
					
					// Find the thing we want to hit... on the same line.
					while ( 
							search.parentNode && search.nextSibling && search.nextSibling.parentNode
							&& (search.parentNode === search.nextSibling.parentNode)
							&& (search.offsetTop === search.nextSibling.offsetTop )
					){
						search=search.nextSibling
					}

					// Find the last one, and force the cursor to the right of it.
					cursor.target( search,false,true );

					evt.keyCode = 0; // The less obvious approach
					if (evt.preventDefault) evt.preventDefault(); // the more obvious approach
					inputSuppressNextKeypress=true;
					return false;
					break;

				case 36: // Home
					var search = cursor.blinker;
					
					// Find the thing we want to hit... on the same line.
					while ( 
							search.parentNode && search.previousSibling && search.previousSibling.parentNode
							&& (search.parentNode === search.previousSibling.parentNode)
							&& (search.offsetTop === search.previousSibling.offsetTop )
					){
						search=search.previousSibling
					}

					// Find the last one, and force the cursor to the right of it.
					cursor.target( search,true,false );

					evt.keyCode = 0; // The less obvious approach
					if (evt.preventDefault) evt.preventDefault(); // the more obvious approach
					inputSuppressNextKeypress=true;
					return false;
					break;

				case 37: // left

					var search = cursor;
					while (search !== null){
						search = search.previousSibling;
						if (search){
							search.click();
							break;
						}
					}

					// Prevent browser scrolling.
					evt.keyCode = 0; // The less obvious approach
					if (evt.preventDefault){ evt.preventDefault(); }

					inputSuppressNextKeypress=true;
					return false;
					break;

				case 39: // right

					var search = cursor;
					while (search !== null){
						search = search.nextSibling;
						if (search){
							search.click();
							break;
						}
					}

					// Prevent browser scrolling
					evt.keyCode = 0; // The less obvious approach
					if (evt.preventDefault){ evt.preventDefault(); }

					inputSuppressNextKeypress=true;
					return false;
					break;

				case 46: // del
					if (cursor.blinker.nextSibling){ cursor.blinker.parentNode.removeChild(cursor.blinker.nextSibling)}

					inputSuppressNextKeypress = true;
					break;

				default:
					inputSuppressNextKeypress=false;

			}

		},
		// Handler for keypress:
		keypress: function (evt){
			console.log("keypress")
			if (!cursor.isReady()) return;
			if (inputSuppressNextKeypress) return;

			// Figure out other reasons to get out of this place.
			var evt = evt || window.event
			var chr = String.fromCharCode(evt.keyCode || evt.which)
			var newChrNode;


			//console.log("keypress", evt.keyCode)


			if (evt.keyCode===13){ chr = '\n' }

			if (chr){
				newChrNode = mkCharNode(chr);
				cursor.blinker.parentNode.insertBefore(newChrNode, cursor.blinker);	
			}
		}



	};

	// Stash the blinker right away.
	cursor.stash();

	// Style the blinker
	cursor.blinker.style.display = 'inline-block';
	cursor.blinker.style.borderRightWidth='2px';
	cursor.blinker.style.borderRightStyle='solid';
	cursor.blinker.style.borderRightColor='black';
	cursor.blinker.style.marginLeft='-1px';
	cursor.blinker.style.marginRight='-1px';
	cursor.blinker.style.width='0px';
	cursor.blinker.innerHTML='&nbsp;';



	// Public declarations:

	goofyText = {
		editor: function(){
			var content;
			if (arguments.length){
				for (var i=0; i<arguments.length; ++i){
					initializeNode(arguments[i]);
					setContent(arguments[i], content);
				}

			} else {
				var element = document.createElement("DIV");
				initializeNode(element);
				return element;

			}			
		}
	};


	/****************************************
	 ****************************************

				One-time setup

	 ****************************************
	 ****************************************/

	 on.call(document, 'keydown', cursor.keydown);
	 on.call(document, 'keypress', cursor.keypress);
	 on.call(document, 'click', function(){
	 	cursor.stash();
	 });


	// Debugging info-- cut from builds
	if (true){ 
		// Global
		goofyTextDebug = {
			cursor: cursor,
			cursorAppearance: function(){
				var testEl = document.createElement("DIV");
				var testSpan;

				testEl.innerHTML = 'NewLine:<br /><span>SpanOne</span><span id="goofyTextCursorTest">SpanTwo</span><span>SpanThree</span><br />Newline';
				document.body.appendChild(testEl);

				testSpan = document.getElementById('goofyTextCursorTest');
				testSpan.parentNode.insertBefore( cursor.blinker, testSpan);

				cursor.cycle();


			}
		};

		// Other debug junk

		goofyTextDebug.cursorAppearance();


	}

})();