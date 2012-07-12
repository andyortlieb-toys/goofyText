;(function(){

	// Private declarations
	var
		/**
		 * private cursor
		 * maintains a reference to the single global cursor.
		 */
		cursor
		,cursorCycleTimeout
		,cursorCycleNextColor = 'black'
		,cursorHistory = []
		,cursorSuppressClear = false
		,inputSuppressNextKeypress

	; // End private declarations


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
	 * private cursorHistoryClear
	 */
	function cursorHistoryClear(){
		var thingToClear;
		var cursorInThere = false;

		while (thingToClear = cursorHistory.pop()){
			if (thingToClear == cursor){
				cursorInThere = true;
			} else {
				thingToClear.style.borderLeftStyle = 'none';
				thingToClear.style.borderLeftColor = 'white';
				thingToClear.style.marginLeft = '0px';
			}
		}

		if (cursorInThere) cursorHistory.push(cursor);
	}

	/**
	 * private cursorCycle
	 * cycles the cursor, wherever it may be
	 */
	function cursorCycle(update){
		
		cursorHistoryClear();

		// Set the cursor color
		if (cursor && cursor.style){
			cursorCycleNextColor= update||(cursorCycleNextColor==='white')?'black':'white';

			cursor.style.borderLeftWidth =  '1px';
			cursor.style.borderLeftStyle =  'solid';
			cursor.style.borderLeftColor =  cursorCycleNextColor;
			cursor.style.marginLeft = '-1px';

			// FIXME FIXME FIXME!!!!
			// For some reason setting a background color allows the cursor to flash in IE7.
			// All other browsers are fine without this.
			cursor.style.backgroundColor = cursor.style.backgroundColor||'transparent';
			// FIXTHAT ^ 			

		}

		clearTimeout(cursorCycleTimeout);

		cursorCycleTimeout = setTimeout( cursorCycle, update?960:480 );
	}

	function mkChar (character){
		var chr = document.createElement('span')

		if ( character ==='\n' ) {
			chr.innerHTML = "\n<br />";
			chr.isNewLine = true;

		} else if (character===' ') {
			chr.innerHTML = "<span style='display:inline-block'>&nbsp;</span>";

		} else {
			if (chr.textContent!==undefined){
				chr.textContent = character;
			} else {
				chr.innerText = character;
			}
			
		}

		on.call(chr, 'click', function(){
			cursor = chr;
			cursorSuppressClear = true;
			cursorHistory.push(chr);
			cursorCycleNextColor = 'black';
			cursorCycle(true);
		});

		return chr;
	}

	/**
	 * private initializeGoofyTextElement
	 * Converts an element into a goofyText 
	 */
	function initializeGoofyTextElement(el){
		if (el.goofyTextInitialized) return;
		el.goofyTextInitialized = true;

		var placeHolder	= document.createElement('div');
		var throwAway 	= document.createElement('div');
		var chr 		= null;
		
		// Find textNodes and explode them into goofyText chrs.
		// Other nodes will just be reused verbatim.
		// All of these things will be pushed onto the placeHolder element.
		while (el.childNodes.length){
			var cNode = el.childNodes[0];

			if (!cNode) return false;
			
			if (cNode.nodeType===3){
				// It's a text el, break it up int chrs
				for (var i=0; i<cNode.length; ++i){

					if (cNode.textContent){
						chr = mkChar(cNode.textContent[i]);

					} else if (cNode.nodeValue){
						chr = mkChar(cNode.nodeValue.charAt(i));

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

		// Move all the children filed into placeHolder back into the
		// original element.
		while (placeHolder.childNodes.length){
			el.appendChild(placeHolder.childNodes[0]);
		}

		el.style.paddingLeft = el.style.paddingLeft || '2px'
		el.style.paddingRight = el.style.paddingRight || '2px'

	}

	function handleKeypress (evt){
		if (!cursor) return;
		if (inputSuppressNextKeypress) return;

		// Figure out other reasons to get out of this place.
		var evt = evt || window.event
		var chr = String.fromCharCode(evt.keyCode || evt.which)
		var newChrNode;


		//console.log("keypress", evt.keyCode)


		if (evt.keyCode===13){ chr = '\n' }

		if (chr){
			newChrNode = mkChar(chr);
			cursor.parentNode.insertBefore(newChrNode, cursor);

			// FIXME: Since switching away from Ext, this doesn't solve the issue anymore.
			cursor.click();
		}

	}

	function handleKeydown (evt){ 
		if (!cursor) return;

		var evt = evt || window.event
		var chr = String.fromCharCode(evt.keyCode)
		//console.log("keydown", evt.keyCode, a=evt);
		
		switch (evt.keyCode){
			case 8: // backspace
				var search = cursor.previousSibling;
				
				if (search){
					cursor.parentNode.removeChild(search)
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

			case 35: // End
				
				while ( 
						cursor.parentNode && cursor.nextSibling && cursor.nextSibling.parentNode
						&& (cursor.parentNode === cursor.nextSibling.parentNode)
						&& (cursor.offsetTop === cursor.nextSibling.offsetTop )
				){
					cursor.nextSibling.click();

				}

				inputSuppressNextKeypress = true;
				break;

			case 36: // Home
				
				while ( 
						cursor.parentNode && cursor.previousSibling && cursor.previousSibling.parentNode
						&& (cursor.parentNode === cursor.previousSibling.parentNode)
						&& (cursor.offsetTop === cursor.previousSibling.offsetTop )
				){
					cursor.previousSibling.click();

				}

				inputSuppressNextKeypress = true;
				break;

			case 37: // left

				console.log ("Going left")
				var search = cursor;
				while (search !== null){
					search = search.previousSibling;
					if (search){
						search.click();
						break;
					}
				}

				if (evt.preventDefault){ evt.preventDefault(); }

				inputSuppressNextKeypress=true;
				break;

			case 39: // right

				console.log ("Going right")
				var search = cursor;
				while (search !== null){
					search = search.nextSibling;
					if (search){
						search.click();
						break;
					}
				}

				inputSuppressNextKeypress=true;
				break;

			case 46: // del

				var nextCursor = cursor.nextSibling || cursor.previousSibling

				cursor.parentNode.removeChild(cursor);
				cursor = nextCursor;

				inputSuppressNextKeypress = true;
				break;

			default:
				inputSuppressNextKeypress=false;


		}

	}

	// Public declarations

	/** 
	 * public goofyText
	 * Namespace for all public goofyText references and methods
	 */
	goofyText = {};	

	goofyText.editor= function(){
		if (arguments.length){
			for (var i=0; i<arguments.length; ++i){
				initializeGoofyTextElement(arguments[i]);
			}

		} else {
			var element = document.createElement("DIV");
			initializeGoofyTextElement(element);
			return element;

		}
	}

	// End public declarations


	/****************************************
	 ****************************************

				One-time setup

	 ****************************************
	 ****************************************/


	 on.call(document, 'keydown', handleKeydown);
	 on.call(document, 'keypress', handleKeypress);
	 on.call(document, 'click', function(){
	 	if (!cursorSuppressClear){
	 		cursor = null;
	 		cursorHistoryClear();
	 	}
	 	cursorSuppressClear = false;
	 });

	 // DEBUG STUFF
	 if (true){
	 	goofyText.debug = {
	 		cursor : function(){return cursor;}
			,cursorCycleTimeout : cursorCycleTimeout
			,cursorHistory : cursorHistory
			,on : on
			,off : off
			,cursorHistoryClear : cursorHistoryClear
			,cursorCycle : cursorCycle
			,eval: function(str){ eval(str); }
	 	}
		console.log("Loaded GoofyText")	
		 	
	 }

	
})();
