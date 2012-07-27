


;(function(){

	// Support methods...

	// Determines if node `b` shares a common Y with node `a`
	function sameLattitude(a,b){
		var aTop, aBot, bTop, bBot;

		if ( a && b && a.parentNode === b.parentNode){

			aTop = a.offsetTop;
			aBot = aTop+a.offsetHeight;
			bTop = b.offsetTop;
			bBot = bTop+b.offsetHeight;

			// Find the the things that cannot be...

			// B is newline? Don't bother!
			if (b.isNewLine) return false;

			// Bottoms are above Tops
			if ( aBot < bTop || bBot < aTop ) {
				return false;
			}

			// Tops are below bottoms...
			if ( aTop > bBot || bTop > aBot ) {
				return false;
			}

			// If tops equal bottoms... their bottoms better also.
			if ( aTop === bBot ){
				return ( aBot === bBot )
			}
			if ( bTop === aBot ){
				return ( bBot === aBot );
			}

			// Find the things that make it so...
			return true;
		}

		return false;
	}

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

		// Use native method in Chrome.
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

			// inline-block span prevents lagging newlines.
			// Without it, browsers don't show the newline until more text exists after it.
			chrNode.innerHTML = "\n<br /><span style='display:inline-block;'></span>";
			chrNode.isNewLine = true;

		} else if (character===' ') {
			// &nbsp inside span gives the best of both worlds:
			// 1. sequential &nbsp; allows multiple spaces to appear side-by-side
			// 2. span allows the lines to break/wrap themselves.
			chrNode.innerHTML = "<span style='display:inline-block'>&nbsp;</span>";

		} else if (character==='\t'){
			// Fixme: We might find a better way to represent this.
			chrNode.innerHTML = "<span style='display:inline-block;'>&nbsp;&nbsp;&nbsp;&nbsp;</span>";
			chrNode.isTab = true;

		} else {
			if (chrNode.textContent!==undefined){
				chrNode.textContent = character;
			} else {
				chrNode.innerText = character;
			}

		}

		chrNode.goofyTextChr = true;
		chrNode.goofyTextDeletable = true;
		// It Might makes sense to refactor this.  if we start calling .click() at any point.
		on.call(chrNode, 'click', function(){
			cursor.target(chrNode);
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

	function mkHijacker(){
		var hijacker = document.createElement('textarea');

		on.call(hijacker, 'keydown', cursor.keydown);

		if (hijacker.oninput !== undefined){
		on.call(hijacker, 'input', function(){
			cursor.processHijacker(hijacker);
		});

		} else {
			on.call(hijacker, 'keydown', function(){
				setTimeout( function(){
					cursor.processHijacker(hijacker)
				}, 5);
			});
		}

		hijacker.style.position='relative';
		hijacker.style.left='0px';
		hijacker.style.top='0px';
		hijacker.style.width='1px';
		hijacker.style.height='1px';
		hijacker.style.padding='0px';
		hijacker.style.border='0px';
		hijacker.style.margin='0px';
		hijacker.style.overflow='hidden';
		hijacker.style.backgroundColor='red'; // FIXME


		hijacker.wrapper = document.createElement('div');
		hijacker.wrapper.style.position='absolute';
		hijacker.wrapper.style.display='inline-block';
		hijacker.wrapper.style.left='1px';
		hijacker.wrapper.style.top='1px';

		hijacker.wrapper.style.backgroundColor='orange';
		hijacker.wrapper.style.width='0px';
		hijacker.wrapper.style.height='0px';
		//hijacker.wrapper.style.overflow='hidden';

		hijacker.wrapper.appendChild(hijacker);

		//hijacker.wrapper = hijacker;


		return hijacker;


	};


	function initializeNode(node){
		if (node.goofyTextInitialized){ return; }
		node.goofyTextInitialized = true;

		node.style.position='relative'

		var originalContent = getOriginalContent(node);
		node.innerHTML = '';
		setContent(node, originalContent);

		on.call(node, 'click', function(){
			/*if (cursor.preventNonCharClick){
				cursor.preventNonCharClick = false
				return;
			}*/
			console.log("STUB: Search for the last place a cursor could go before this point.");
		})

		node.hijacker = mkHijacker(node);
		node.insertBefore(node.hijacker.wrapper, node.firstChild);

		return node;
	}


	// Private Declarations...

	// Information regarding where the cursor lives
	var cursor = {
		// The actual element that blinks.
		targetCharNode: null,
		// Cache the target editor
		targetEditor: null,
		// The cursor thing that blinks...
		blinker: document.createElement('span'),
		//processHijacker...
		processHijacker: function(){
			var hijacker = cursor.targetEditor.hijacker;
		 	var buffer = hijacker.value;
		 	hijacker.value='';
		 	cursor.putText(buffer);
		},
		// The next color of the cursor:
		nextColor: 'black',
		colorA: 'black',
		colorB: 'transparent',
		// timeout id
		cycleTimeout: null,
		//whether to prevent un-targeting the cursor.
		preventUntarget: false,
		// method to cycle the cursor.
		cycle: function(update){
			// Set the cursor color
			if (cursor.targetCharNode){
				cursor.nextColor= update||(cursor.nextColor===cursor.colorB)?cursor.colorA:cursor.colorB;

				cursor.blinker.style.backgroundColor = cursor.nextColor;

				var x = cursor.targetCharNode.offsetLeft;
				var y = cursor.targetCharNode.offsetTop;
				// FIXME:
				//cursor.targetEditor.hijacker.style.left=''+xy[0]+'px';
				cursor.targetEditor.hijacker.style.left=''+x+'px';
				cursor.targetEditor.hijacker.style.top=''+y+'px';

				//cursor.targetEditor.insertBefore( cursor.blinker, cursor.targetEditor.firstChild );

				cursor.blinker.style.top='3px';
				cursor.blinker.style.height='1em';

				if (cursor.targetCharNode.forceRight){
					//cursor.targetCharNode.style.borderRightColor = cursor.nextColor;
					//cursor.blinker.style.left=''+(x+cursor.targetCharNode.offsetWidth)+'px';

					cursor.targetCharNode.appendChild(cursor.blinker);


				} else {
					//cursor.targetCharNode.style.borderLeftColor = cursor.nextColor;
					//cursor.blinker.style.left='0px';

					cursor.targetCharNode.insertBefore(cursor.blinker, cursor.targetCharNode.firstChild);

				}

			}

			// Clear & reset the timout
			clearTimeout(cursor.cycleTimeout);
			cursor.cycleTimeout = setTimeout( cursor.cycle, update?960:480 );
		},
		// Method target puts a cursor around a chrNode
		target: function(chrNode,forceRight){
			if (cursor.targetCharNode !== chrNode){
				cursor.untarget(cursor.targetCharNode);
			} else if (forceRight === undefined){
				// It is the same. just switch sides. (unless it's being set)
				forceRight = !cursor.targetCharNode.forceRight;
			}

			cursor.targetCharNode = chrNode;
			cursor.targetEditor = cursor.getEditor(chrNode);

			// FIXME: Stupid stupid hack for ie7.
			cursor.targetCharNode.style.backgroundColor = cursor.targetCharNode.style.backgroundColor||'transparent';

			cursor.targetCharNode.forceRight = forceRight;

			cursor.cycle( true );
			cursor.preventUntarget = true;
			cursor.targetEditor.hijacker.click();
			cursor.targetEditor.hijacker.focus();
			cursor.preventUntarget = true;

			scrollIntoViewIfNeeded( cursor.targetCharNode );
		},
		untarget: function(){
			if (cursor.preventUntarget){
				cursor.preventUntarget = false;
				return;
			}
			if (cursor.blinker.parentNode) cursor.blinker.parentNode.removeChild(cursor.blinker);
			if (!cursor.targetCharNode || !cursor.targetCharNode.style) return ;

			cursor.targetCharNode = null;
		},


		// isReady, whether or not the cursor is ready to handle keys
		isReady: function(){
			return cursor.targetCharNode;
		},

		// getEditor, gets the editor of the cursor.
		getEditor: function(){
			var s = cursor.targetCharNode;
			while ( s !== null && !s.goofyTextInitialized ){s=s.parentNode}
			return s;
		},

		putNode: function(node){
			if (cursor.targetCharNode.forceRight){
				// Put the new node AFTER the targetCharNode, and target the new node.
				cursor.targetCharNode.parentNode.insertBefore(node, cursor.targetCharNode.nextSibling);

				if (node.nextSibling && node.nextSibling.goofyTextChr){
					cursor.target(node.nextSibling);
				} else {
					cursor.target(node, true);
				}
			} else {
				// Business as usual.
				cursor.targetCharNode.parentNode.insertBefore(node, cursor.targetCharNode);
				cursor.cycle(true)

			}
			scrollIntoViewIfNeeded(node);
			return cursor;

		},
		putChar: function(tChr){
			cursor.putNode(mkCharNode(tChr));
		},
		putText: function(text){
			var ieProblem = !!window.attachEvent; // Detect the ie problem.
			var lastCharPut=false
			for (var i=0; i<text.length; ++i){
				if (			i>1 // Text was probably pasted.
								&& ieProblem
								&& lastCharPut
								&& text.charAt(i)==='\n'){
					lastCharPut = false;
					continue
				}
				lastCharPut = true;
				cursor.putChar(text.charAt(i));
			}

		},

		// Handler for keydown:
		keydown: function (evt){
			if (!cursor.isReady()) return;

			var evt = evt || window.event
			var chr = String.fromCharCode(evt.keyCode)


			switch (evt.keyCode){
				case 8: // backspace

					if (cursor.targetCharNode.forceRight){
						var removeGuy = cursor.targetCharNode;
						if (removeGuy.goofyTextDeletable){
							cursor.target(cursor.targetCharNode.nextSibling||cursor.targetCharNode.previousSibling, !cursor.targetCharNode.nextSibling);
							removeGuy.parentNode.removeChild(removeGuy);
						}
					} else {
						if (cursor.targetCharNode.previousSibling && cursor.targetCharNode.previousSibling.goofyTextDeletable){
							cursor.targetCharNode.parentNode.removeChild(cursor.targetCharNode.previousSibling)
						}
					}

					// Stupid thing to stop the browser from going back.
					evt.keyCode = 0; // The less obvious approach
					if (evt.preventDefault) evt.preventDefault(); // the more obvious approach
					break;

				case 9: // tab
					cursor.untarget();

					break;

				case 13: // NewLine...
					cursor.putChar("\n");

					evt.keyCode = 0; // The less obvious approach
					if (evt.preventDefault) evt.preventDefault(); // the more obvious approach
					return false;
					break;

/*				case 32: // space
					// Stupid thing to stop the browser from scrolling downward.
					evt.keyCode = 0; // The less obvious approach
					if (evt.preventDefault) evt.preventDefault(); // the more obvious approach
					inputSuppressNextKeypress=false;
					cursor.keypress({keyCode: 32});
					inputSuppressNextKeypress=true;
					return false;
					break;*/

				case 35: // End
					var search = cursor.targetCharNode;

					// Find the thing we want to hit... on the same line.
					while (sameLattitude(cursor.targetCharNode, search.nextSibling)){
						search=search.nextSibling
					}

					// Find the last one, and force the cursor to the right of it.
					cursor.target( search, !search.isNewLine );

					evt.keyCode = 0; // The less obvious approach
					if (evt.preventDefault) evt.preventDefault(); // the more obvious approach
					return false;
					break;

				case 36: // Home
					var search = cursor.targetCharNode;

					// Find the thing we want to hit... on the same line.
					while ( sameLattitude(cursor.targetCharNode, search.previousSibling) ){
						search=search.previousSibling
					}


					// Find the last one, and force the cursor to the right of it.
					cursor.target( search,false );

					evt.keyCode = 0; // The less obvious approach
					if (evt.preventDefault) evt.preventDefault(); // the more obvious approach
					return false;
					break;

				case 37: // left

					var search = cursor.targetCharNode;


					while (search !== null){
						if (search.forceRight){
							// Re-target the same node.
							cursor.target(search, false);
							break;
						}

						search = search.previousSibling;
						if (search && search.goofyTextChr){
							cursor.target(search, !search.nextSibling.goofyTextChr);
							break;
						}
					}

					// Prevent browser scrolling.
					evt.keyCode = 0; // The less obvious approach
					if (evt.preventDefault){ evt.preventDefault(); }

					return false;
					break;

				case 39: // right
					// Find the next place to the right that a cursor could be.
					var search = cursor.targetCharNode;

					while (search !== null){
						search = search.nextSibling;
						if (search && search.goofyTextChr){
							cursor.target(search, (search===cursor.targetCharNode));
							break;

						} else if ( !cursor.targetCharNode.forceRight ){
							search = null;

						}
					}

					if (!search) { cursor.target(cursor.targetCharNode, true); }

					// Prevent browser scrolling
					evt.keyCode = 0; // The less obvious approach
					if (evt.preventDefault){ evt.preventDefault(); }

					return false;
					break;

				case 46: // del
					if (cursor.targetCharNode.forceRight){
						if (cursor.targetCharNode.nextSibling && cursor.targetCharNode.nextSibling.goofyTextDeletable){
							cursor.targetCharNode.parentNode.removeChild(cursor.targetCharNode.nextSibling)
						}
					} else {
						var removeGuy = cursor.targetCharNode;
						if (removeGuy.goofyTextDeletable){
							cursor.target(cursor.targetCharNode.nextSibling || cursor.targetCharNode.previousSibling);
							cursor.targetCharNode.parentNode.removeChild(removeGuy)
						}
					}


					break;

				default:
					// FIXME: Should we scrap this default?

					break;
			}
		}
	};

	function editor(){
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

	// Public declarations:
	window['goofyText'] = {};
	window['goofyText']['editor'] = editor;


	/****************************************
	 ****************************************

				One-time setup

	 ****************************************
	 ****************************************/

	on.call(document, 'click', function(){
	 	cursor.untarget();
	});


	cursor.blinker.style.position='relative';
	cursor.blinker.style.display='inline-block';
	cursor.blinker.style.width='2px';
	cursor.blinker.style.height='1em';
	cursor.blinker.style.marginRight='-2px';
	cursor.blinker.style.backgroundColor='purple';


	// Debugging info-- cut from builds
	if (true){
		// Global
		goofyTextDebug = {
			cursor: cursor
		};

		b=cursor.blinker;

	}

})();