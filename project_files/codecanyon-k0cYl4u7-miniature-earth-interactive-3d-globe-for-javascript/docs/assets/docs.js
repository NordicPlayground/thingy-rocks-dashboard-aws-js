document.addEventListener( "DOMContentLoaded", function(){
	
	
	// generate docs page index
	
	if ( document.body.classList.contains('has-index') ) {
		
		var index_code = '<ul id="index">';
		
		var i=0;
		
		document.querySelectorAll('h2').forEach( function(item) {
			
			i++;
			
			if ( ! item.getAttribute('id') ) {
				item.setAttribute('id', 'section_'+i);
			}
			
			index_code += '<li><a href="#'+ item.getAttribute('id') +'">'+ item.innerHTML +'</a></li>';
			
		} );
		
		index_code += '</ul>';
		
		document.getElementById('docs').insertAdjacentHTML( 'beforebegin', index_code );
		
	}
	
	
} );