;(function(){
	
	goofyText = {

			cursorHistory: []
			, cursorNextColor: 'black'
			, cursorblackCycles: 0
			, cursorTimeoutId: null
			, suppressClearChar: false
			, suppressNextKeypress: false
			, targetChar: false

			, domMethods: {
				on: function(evtName, callBack){
					if (this.addEventListener){
						return this.addEventListener(evtName, callBack)

					} else if (this.attachEvent){
						return this.attachEvent(evtName, callBack)

					} else {
						throw "Unable to attach event."
					}
				}

				,off: function(evtName, callBack){
					if (this.removeEventListener){
						return this.removeEventListener(evtName, callBack)

					} else if (this.detachEvent){
						return this.detachEvent(evtName, callBack)

					} else {
						throw "Unable to attach event."
					}
				}
			}

			, clearFlipHistory: function(){

				for (var i=0;i<goofyText.cursorHistory.length; ++i){

					if (goofyText.cursorHistory[i] === goofyText.targetChar) continue;

					goofyText.cursorHistory[i].style.borderLeft = 'inherit';
					goofyText.cursorHistory[i].style.borderLeft = 'inherit';
				}
			}

			, cursorFlip: function(){

				goofyText.clearFlipHistory();

				if (goofyText.targetChar && goofyText.targetChar.style){
					
					if (goofyText.cursorblackCycles){
						goofyText.cursorNextColor = 'black';
						goofyText.cursorblackCycles--;
					}

					goofyText.targetChar.style.borderLeft =  '1px solid '+goofyText.cursorNextColor;
					goofyText.targetChar.style.borderLeft = '-1px';

					goofyText.cursorNextColor= goofyText.cursorNextColor==='white'?'black':'white';
					clearTimeout(goofyText.cursorTimeoutId);
					goofyText.cursorTimeoutId = setTimeout( goofyText.cursorFlip, 480 )
				} else {
					goofyText.cursorNextColor = 'black';
				}
				

			}


			, init: function(){
					goofyText.domMethods.on.call(document, 'click', function(){
						setTimeout( goofyText.clearFlipHistory, 50) // Less delay for "blurring" the field.
						if (!goofyText.suppressClearChar){
							goofyText.targetChar = null;
							
						}else{
							goofyText.suppressClearChar = false;
						}
					});				

					goofyText.cursorFlip();

					document.onkeypress = function(evt){
						if (!goofyText.targetChar) return;
						if (goofyText.suppressNextKeypress) return;

						// Figure out other reasons to get out of this place.

						var evt = evt || window.event
						var chr = String.fromCharCode(evt.keyCode || evt.which)
						var newChrNode;

						if (evt.keyCode===13){ chr = '\n' }

						if (chr){
							newChrNode = goofyText.mkChar(chr);
							goofyText.targetChar.parentNode.insertBefore(newChrNode, goofyText.targetChar);
							goofyText.setClick(newChrNode);

							// FIXME: Since switching away from Ext, this doesn't solve the issue anymore.
							goofyText.targetChar.click();
						}

					}

					document.onkeydown = function(evt){
						if (!goofyText.targetChar) return;

						var evt = evt || window.event
						var chr = String.fromCharCode(evt.keyCode)

						switch (evt.keyCode){
							case 8: // backspace
								var search = goofyText.targetChar.previousSibling;
								
								if (search && search.className === 'chr'){
									goofyText.targetChar.parentNode.removeChild(search)
								}
								
								// Stupid thing to stop the browser from going back.
								evt.keyCode = 0;

								goofyText.suppressNextKeypress=true;
								break;

							case 9: // tab
								goofyText.targetChar = null;

								goofyText.suppressNextKeypress=true;
								break;

							case 37: // left

								console.log ("Going left")
								var search = goofyText.targetChar;
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
								var search = goofyText.targetChar;
								while (search !== null){
									search = search.nextSibling;
									if (search && search.className === 'chr'){
										search.click();
										break;
									}
								}

								goofyText.suppressNextKeypress=true;
								break;

							default:
								goofyText.suppressNextKeypress=false;


						}

					}
			}

			, setup: function(node){
				if (node.goofyTextSetup) return false;
				node.goofyTextSetup = true;

				var placeHolder	= document.createElement('div');
				var throwAway 	= document.createElement('div');
				var chr 		= null;

				
				// Find textNodes and explode them into goofyText chrs.
				// Other nodes will just be reused verbatim.
				// All of these things will be pushed onto the placeHolder element.
				while (node.childNodes.length){
					var cNode = node.childNodes[0];

					if (!cNode) return false;
					
					if (cNode.nodeType===3){
						// It's a text node, break it up int chrs
						for (var i=0; i<cNode.length; ++i){

							if (cNode.textContent){
								chr = goofyText.mkChar(cNode.textContent[i]);

							} else if (cNode.nodeValue){
								chr = goofyText.mkChar(cNode.nodeValue[i]);

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
					node.appendChild(placeHolder.childNodes[0]);
				}


				// Add clicks to each char
				var chrList = node.querySelectorAll('span.chr');

				for (var iChr=0; iChr<chrList.length; ++iChr){
				 	goofyText.setClick(chrList[iChr]);
				};


			}

			, _clickHandler: function(){
				goofyText.targetChar = this;
			  	goofyText.cursorHistory.push(this);
			  	goofyText.suppressClearChar = true;
			  	goofyText.cursorNextColor = 'black';
			  	goofyText.cursorFlip();
			}

			, setClick: function(node){

			 	goofyText.domMethods.on.call(node, 'click', goofyText._clickHandler);
			}

			, mkChar: function(character){
				var chr = document.createElement('span')
				chr.className = 'chr'

				if ( character ==='\n' ) {
					chr.innerHTML = "<br />"

				} else {
					if (chr.textContent!==undefined){
						chr.textContent = character;
					} else {
						chr.innerText = character;
					}
					
				}

				return chr

			}


		}

		goofyText.editor = function(){};

		goofyText.init();
		
})();