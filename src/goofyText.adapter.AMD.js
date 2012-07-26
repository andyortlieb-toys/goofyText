define(function(require){
	require('./goofyTextBase');
	var goofyTextRef = goofyText;

	try {
		delete goofyText;
	} catch(e){
		goofyText = undefined;
	}

	return {
		goofyText: goofyTextRef
		,editor: goofyTextRef.editor
	};
});