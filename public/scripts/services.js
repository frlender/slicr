Lich.factory('download',function(){
	return function(data){
		var form = document.createElement('form');
  		form.setAttribute('method', 'post');
  		form.setAttribute('action', baseURL+'download');

  		var listField = document.createElement('input');
  		listField.setAttribute('type', 'hidden');
  		listField.setAttribute('name', 'data');
  		listField.setAttribute('value', JSON.stringify(data));
  		form.appendChild(listField);

  		document.body.appendChild(form);
  		form.submit();
  		document.body.removeChild(form);
	}
});
Lich.factory('enrichr',function(){
  return function(list,description){
      var options = {
        description: description,
        list:list.join('\n'),
        popup: true
      };

      if (typeof options.description == 'undefined')
        options.description = defaultOptions.description;
      if (typeof options.popup == 'undefined')
        options.popup = defaultOptions.popup;
      if (typeof options.list == 'undefined')
        alert('No genes defined.');

      var form = document.createElement('form');
      form.setAttribute('method', 'post');
      form.setAttribute('action', 'http://amp.pharm.mssm.edu/Enrichr/enrich');
      if (options.popup)
        form.setAttribute('target', '_blank');
      form.setAttribute('enctype', 'multipart/form-data');

      var listField = document.createElement('input');
      listField.setAttribute('type', 'hidden');
      listField.setAttribute('name', 'list');
      listField.setAttribute('value', options.list);
      form.appendChild(listField);

      var descField = document.createElement('input');
      descField.setAttribute('type', 'hidden');
      descField.setAttribute('name', 'description');
      descField.setAttribute('value', options.description);
      form.appendChild(descField);

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    }
})
.filter('hasAnyItem',function(){
  return function(types){
    return types.filter(function(type){return type.hasAnyItem()})
  }
});

