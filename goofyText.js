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

	; // End private declarations

	/**
	 * private method eventManager
	 */
	function eventManager(obj, eventName){
		var salvage = obj['on'+eventName];

		obj['on'+eventName] = function(){
			for (var i=0; i<this.goofyTextListeners[eventName].length; ++i){
				this.goofyTextListeners[eventName][i].apply(this, arguments);
			}
		}
	}

	/**
	 * private method on
	 * enables events, intended for DOM objects.	 
	 */
	function on(evtName, callBack){
		if (this===document && !this.goofyTextListeners) this.goofyTextListeners = {};
		if (this===document && !this.goofyTextListeners[evtName]) this.goofyTextListeners[evtName] = eventManager(this, evtName)

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


	function handleKeydown (evt){ 
		console.log('handleKeyDown');
		if (!cursor) return;

		var evt = evt || window.event
		var chr = String.fromCharCode(evt.keyCode)
		console.log("keydown", evt.keyCode)

		switch (evt.keyCode){
			case 8: // backspace
				var search = cursor.previousSibling;
				
				if (search && search.className === 'chr'){
					cursor.parentNode.removeChild(search)
				}
				
				// Stupid thing to stop the browser from going back.
				evt.keyCode = 0;

				goofyText.suppressNextKeypress=true;
				break;

			case 9: // tab
				cursor = null;

				goofyText.suppressNextKeypress=true;
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

				goofyText.suppressNextKeypress=true;
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

				goofyText.suppressNextKeypress=true;
				break;

			case 46: // del
				var search = cursor.nextSibling;
				
				if (search && search.className === 'chr'){
					cursor.parentNode.removeChild(search)
				}
				
				// Stupid thing to stop the browser from going back.
				evt.keyCode = 0;								

				goofyText.suppressNextKeypress = true;
				break;

			default:
				goofyText.suppressNextKeypress=false;


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