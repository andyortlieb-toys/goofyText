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
		target: function(chrNode){
			if (chrNode.previousSibling===cursor.blinker){
				chrNode.parentNode.insertBefore( cursor.blinker, chrNode.nextSibling );
			} else {
				chrNode.parentNode.insertBefore( cursor.blinker, chrNode );
			}
		}
	};

	// Style the blinker
	cursor.blinker.style.display = 'inline-block';
	cursor.blinker.style.borderRightWidth='2px';
	cursor.blinker.style.borderRightStyle='solid';
	cursor.blinker.style.borderRightColor='black';
	cursor.blinker.style.marginRight='-2px';
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