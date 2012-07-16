;(function(){

	// Private Declarations...
	
	// Information regarding where the cursor lives
	var cursor = {

		// The actual element that blinks.
		blinker: document.createElement('span'),

		// The character to associate the cursor position with.
		character: null,

		// Whether or not the cursor is *before* the cursor.character...
		isBeforeChar: true,

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

			clearTimeout(cursor.cycleTimeout);

			cursorCycleTimeout = setTimeout( cursor.cycle, update?960:480 );
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