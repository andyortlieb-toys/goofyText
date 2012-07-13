;(function(){

	// Public Declarations...
	goofyText = {};

	// Private Declarations...
	
	// Information regarding where the cursor lives
	var cursor = {};

	cursor.blinker = document.createElement('span');
	cursor.blinker.style.display = 'inline-block';
	cursor.blinker.style.borderRightWidth='2px';
	cursor.blinker.style.borderRightStyle='solid';
	cursor.blinker.style.borderRightColor='black';



	


	// Debugging info-- cut from builds
	if (true){ 
		// Global
		goofyTextDebug = {
			cursor: cursor
		};
	}

})();