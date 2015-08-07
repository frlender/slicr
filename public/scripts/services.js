Lich.factory('download',function(){
	return function(data){
		var form = document.createElement('form');
  		form.setAttribute('method', 'post');
  		form.setAttribute('action', baseURL+'download');

  		var listField = document.createElement('input');
  		listField.setAttribute('type', 'hidden');
  		listField.setAttribute('name', 'cids');
  		listField.setAttribute('value', JSON.stringify(data));
  		form.appendChild(listField);

  		document.body.appendChild(form);
  		form.submit();
  		document.body.removeChild(form);
	}
});
