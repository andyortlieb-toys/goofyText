;(function(){


	// End public declarations

	
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
	 * private method eventManager
	 */
	function eventManager(obj, eventName){

		obj['on'+eventName] = function(){
			for (var i=0; i<this.goofyTextListeners[eventName].length; ++i){
				this.goofyTextListeners[eventName][i].apply(this, arguments);
			}
		}
		obj['on'+eventName].goofyTextEventManager = true
	}

	/**
	 * private method on
	 * enables events, intended for DOM objects.	 
	 */
	function on(evtName, callBack){
		var salvage = this['on'+evtName];

		if (this===document && !this.goofyTextListeners) this.goofyTextListeners = {};
		if (this===document && !this.goofyTextListeners[evtName]) this.goofyTextListeners[evtName] = eventManager(this, evtName);
		if (salvage && ! salvage.goofyTextEventManager) on.call(this, evtName, callBack)


		if (this.goofyTextListeners) {
			if (!this.goofyTextListeners[evtName]) this.goofyTextListeners[evtName] = [];
			return this.goofyTextListeners[evtName].push(callBack);

		} else if (this.addEventListener){
			return this.addEventListener(evtName, callBack)

		} else if (this.attachEvent){
			return this.attachEvent(evtName, callBack)

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
			return this.detachEvent(evtName, callBack)

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
			cursorHistory[i].style.borderLeft = 'inherit';
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
			cursor.style.borderLeft = '-1px';
		}

		clearTimeout(cursorCycleTimeout);

		cursorCycleTimeout = setTimeout( cursorCycle, update?960:480 )

	}

	/**
	 * private initializeGoofyTextElement
	 * Converts an element into a goofyText 
	 */
	function initializeGoofyTextElement(el){
		if (el.goofyTextInitialized) return;
		el.goofyTextInitialized = true;

		console.log("Stub: convert any existing text")
	}

	function handleKeypress (evt){
		if (!cursor) return;
		if (inputSuppressNextKeypress) return;

		// Figure out other reasons to get out of this place.

		var evt = evt || window.event
		var chr = String.fromCharCode(evt.keyCode || evt.which)
		var newChrNode;

		if (evt.keyCode===13){ chr = '\n' }

		if (chr){
			newChrNode = goofyText.mkChar(chr);
			cursor.parentNode.insertBefore(newChrNode, cursor);
			goofyText.setClick(newChrNode);

			// FIXME: Since switching away from Ext, this doesn't solve the issue anymore.
			cursor.click();
		}

	}

	function handleKeydown (evt){ 
		if (!cursor) return;

		var evt = evt || window.event
		var chr = String.fromCharCode(evt.keyCode)
		
		switch (evt.keyCode){
			case 8: // backspace
				var search = cursor.previousSibling;
				
				if (search && search.className === 'chr'){
					cursor.parentNode.removeChild(search)
				}
				
				// Stupid thing to stop the browser from going back.
				evt.keyCode = 0;

				inputSuppressNextKeypress=true;
				break;

			case 9: // tab
				cursor = null;

				inputSuppressNextKeypress=true;
				break;

			case 37: // left

				console.log ("Going left")
				var search = cursor;
				while (search !== null){
					search = search.previousSibling;
					if (search && search.className === 'chr'){
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
					if (search && search.className === 'chr'){
						search.click();
						break;
					}
				}

				inputSuppressNextKeypress=true;
				break;

			case 46: // del
				var search = cursor.nextSibling;
				
				if (search && search.className === 'chr'){
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