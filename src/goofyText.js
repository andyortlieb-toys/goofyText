;(function(){

	// Support methods...

	/**
	 * findPos...
	 * Thank you, http://txt.binnyva.com/2007/06/find-elements-position-using-javascript/
	 **/
	function findPos(obj) {
		var curleft = curtop = 0;
		if (obj.offsetParent) {
			curleft = obj.offsetLeft
			curtop = obj.offsetTop
			// FIXME: This really needs some TLC
			while (obj = obj.offsetParent) {
				curleft += obj.offsetLeft ;
				curtop += obj.offsetTop ;
			}
		}
		
		return [curleft,curtop];
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
			chrNode.innerHTML = "<br /><span style='display:inline-block;'></span>";
			chrNode.isNewLine = true;

		} else if (character===' ') {
			// &nbsp inside span gives the best of both worlds:
			// 1. sequential &nbsp; allows multiple spaces to appear side-by-side
			// 2. span allows the lines to break/wrap themselves.
			chrNode.innerHTML = "<span style='display:inline-block'>&nbsp;</span>";

		} else if (character==='\t'){
			// Fixme: We might find a better way to represent this.
			chrNode.innerHTML = "<span style='display:inline-block;'>&nbsp;&nbsp;&nbsp;&nbsp;</span>";

		} else {
			if (chrNode.textContent!==undefined){
				chrNode.textContent = character;
			} else {
				chrNode.innerText = character;
			}
			
		}

		chrNode.goofyTextChr = true;
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

	function initializeNode(node){
		if (node.goofyTextInitialized){ return; }
		node.goofyTextInitialized = true;

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



		return node;
	}


	// Private Declarations...

	// Information regarding where the cursor lives
	var cursor = {
		// The actual element that blinks.
		targetCharNode: null,
		// The <TEXTAREA> that allows us to deal with input methods.
		hijacker: document.createElement('textarea'),
		//processHijacker...
		processHijacker: function(){
		 	buffer = cursor.hijacker.value;
		 	cursor.hijacker.value='';
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

				if (cursor.targetCharNode.forceRight){
					cursor.targetCharNode.style.borderRightColor = cursor.nextColor;
				} else {
					cursor.targetCharNode.style.borderLeftColor = cursor.nextColor;	
				}

				var xy = findPos(cursor.targetCharNode);
				// FIXME:
				//cursor.hijacker.style.left=''+xy[0]+'px';
				cursor.hijacker.style.top=''+xy[1]+'px';				
				
			}

			// Clear & reset the timout
			clearTimeout(cursor.cycleTimeout);
			cursor.cycleTimeout = setTimeout( cursor.cycle, update?960:480 );
		}, 
		// Method target puts a cursor around a chrNode
		target: function(chrNode,forceRight){
			if (cursor.targetCharNode !== chrNode){
				cursor.relieve(cursor.targetCharNode);
				cursor.untarget(cursor.targetCharNode);
			} else if (forceRight === undefined){
				// It is the same. just switch sides. (unless it's being set)
				forceRight = !cursor.targetCharNode.forceRight;
				cursor.relieve(cursor.targetCharNode);
			}

			cursor.targetCharNode = chrNode;

			// FIXME: Stupid stupid hack for ie7.
			cursor.targetCharNode.style.backgroundColor = cursor.targetCharNode.style.backgroundColor||'transparent';

			if (forceRight){
				// Put the cursor to the right of chrNode.
				// Style the targetCharNode
				cursor.targetCharNode.style.borderRightWidth='2px';
				cursor.targetCharNode.style.borderRightStyle='solid';
				cursor.targetCharNode.style.borderRightColor='black';
				cursor.targetCharNode.style.marginRight='-2px';
				cursor.targetCharNode.forceRight = true;	

			} else {
				// Put the cursor to the left of chrNode.
				// Style the targetCharNode
				cursor.targetCharNode.style.borderLeftWidth='2px';
				cursor.targetCharNode.style.borderLeftStyle='solid';
				cursor.targetCharNode.style.borderLeftColor='black';
				cursor.targetCharNode.style.marginLeft='-2px';
				cursor.targetCharNode.forceRight = false;
			}

			cursor.cycle( true );
			cursor.preventUntarget = true;
			cursor.hijacker.click();
			cursor.hijacker.focus();
			cursor.preventUntarget = true;
		},
		untarget: function(){
			if (cursor.preventUntarget){
				cursor.preventUntarget = false;
				return;
			}
			if (!cursor.targetCharNode || !cursor.targetCharNode.style) return ;
			cursor.relieve(cursor.targetCharNode);

			cursor.targetCharNode = null;
		},
		relieve: function(node){
			if (node){
				node.forceRight = false;
				if  (node.style){
					// Clear all the styles.
					node.style.borderRightWidth='';
					node.style.borderRightStyle='';
					node.style.borderRightColor='';
					node.style.marginRight='';
					node.style.borderLefttWidth='';
					node.style.borderLeftStyle='';
					node.style.borderLeftColor='';
					node.style.marginLeft='';
				}
			} 
		},

		// isReady, whether or not the cursor is ready to handle keys
		isReady: function(){
			return cursor.targetCharNode;
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
					console.log("Continuing")
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
						cursor.target(cursor.targetCharNode.nextSibling||cursor.targetCharNode.previousSibling, !cursor.targetCharNode.nextSibling);
						removeGuy.parentNode.removeChild(removeGuy);
					} else {
						if (cursor.targetCharNode.previousSibling){
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
					console.log("Enter");
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
					while ( 
							search.parentNode && search.nextSibling && search.nextSibling.parentNode
							&& (search.parentNode === search.nextSibling.parentNode)
							&& (search.offsetTop === search.nextSibling.offsetTop )
					){
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
					while ( 
							search.parentNode && search.previousSibling && search.previousSibling.parentNode
							&& (search.parentNode === search.previousSibling.parentNode)
							&& (search.offsetTop === search.previousSibling.offsetTop )
					){
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
					if (!search) cursor.target(cursor.targetCharNode, true);

					// Prevent browser scrolling
					evt.keyCode = 0; // The less obvious approach
					if (evt.preventDefault){ evt.preventDefault(); }

					return false;
					break;

				case 46: // del
					if (cursor.targetCharNode.forceRight){
						if (cursor.targetCharNode.nextSibling){ cursor.targetCharNode.parentNode.removeChild(cursor.targetCharNode.nextSibling)}
					} else {
						var removeGuy = cursor.targetCharNode;
						cursor.target(cursor.targetCharNode.nextSibling || cursor.targetCharNode.previousSibling);
						cursor.targetCharNode.parentNode.removeChild(removeGuy)
					}
					

					break;

				default:
					// FIXME: Should we scrap this default?
					
					break;
			}

		}




	};

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

	on.call(cursor.hijacker, 'keydown', cursor.keydown);

	on.call(document, 'click', function(){
	 	cursor.untarget();
	});

	if (cursor.hijacker.oninput !== undefined){
	on.call(cursor.hijacker, 'input', function(){
		cursor.processHijacker();
	});
		
	} else {
		on.call(cursor.hijacker, 'keydown', function(){
			setTimeout( cursor.processHijacker, 5);
		});
	}

	cursor.hijacker.style.position='absolute';
	cursor.hijacker.style.left='0px';
	cursor.hijacker.style.top='0px';
	cursor.hijacker.style.width='10px';
	cursor.hijacker.style.height='10px';
	cursor.hijacker.style.padding='0px';
	cursor.hijacker.style.border='0px';
	cursor.hijacker.style.margin='0px';
	cursor.hijacker.style.overflow='hidden';
	cursor.hijacker.style.backgroundColor='red'; // FIXME
	document.body.appendChild(cursor.hijacker);

	// Debugging info-- cut from builds
	if (true){ 
		// Global
		goofyTextDebug = {
			cursor: cursor,
			cursorAppearance: function(){
				var testEl = document.createElement("DIV");
				var testSpan;

				cursor.cycle();


			}
		};

		// Other debug junk

		goofyTextDebug.cursorAppearance();
		h = cursor.hijacker;


	}

})();