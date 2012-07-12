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
		for (var i=0;i<cursorHistory.length; ++i){
			if (cursorHistory[i] === cursor) continue;
			cursorHistory[i].style.borderLeft = 'inherit';
			cursorHistory[i].style.marginLeft = 'inherit';
		}
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

			cursor.style.borderLeft =  '1px solid '+cursorCycleNextColor;
			cursor.style.marginLeft = '-1px';
		}

		clearTimeout(cursorCycleTimeout);

		cursorCycleTimeout = setTimeout( cursorCycle, update?960:480 );
	}

	function mkChar (character){
		var chr = document.createElement('span')

		if ( character ==='\n' ) {
			chr.innerHTML = "<br />";
			chr.isNewLine = true;

		} else if (character===' ') {
			chr.innerHTML = "<div style='display:inline-block;'>&nbsp;</div>";

		} else {
			if (chr.textContent!==undefined){
				chr.textContent = character;
			} else {
				chr.innerText = character;
			}
			
		}

		on.call(chr, 'click', function(){
			cursor = chr;
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

		if (el.goofyTextSetup) return false;
		el.goofyTextSetup = true;

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
						chr = mkChar(cNode.nodeValue[i]);

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


		// Add clicks to each char
		var chrList = el.querySelectorAll('span.chr');

		for (var iChr=0; iChr<chrList.length; ++iChr){
		 	goofyText.setClick(chrList[iChr]);
		};		
	}

	function handleKeypress (evt){
		if (!cursor) return;
		if (inputSuppressNextKeypress) return;

		// Figure out other reasons to get out of this place.
		var evt = evt || window.event
		var chr = String.fromCharCode(evt.keyCode || evt.which)
		var newChrNode;


		console.log("keypress", evt.keyCode)


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
		console.log("keydown", evt.keyCode, a=evt);
		
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

				break;

			case 36: // Home

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

				evt.preventDefault()

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
				var search = cursor.nextSibling;
				
				if (search){
					cursor.parentNode.removeChild(search)
				}
				
				// Stupid thing to stop the browser from going back.
				evt.keyCode = 0;								

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


	 on.call(document, 'keydown', handleKeydown)
	 on.call(document, 'keypress', handleKeypress)

	 // DEBUG STUFF
	 if (true){
	 	goofyText.debug = {
	 		cursor : cursor
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
