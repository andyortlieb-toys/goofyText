;(function(){

	// Public declarations

	/** 
	 * public goofyText
	 * Namespace for all public goofyText references and methods
	 */
	goofyText = {};

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
	 * private method on
	 * enables events, intended for DOM objects.	 
	 */
	function on(evtName, callBack){
		if (this.addEventListener){
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


	/****************************************
	 ****************************************

				One-time setup

	 ****************************************
	 ****************************************/

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