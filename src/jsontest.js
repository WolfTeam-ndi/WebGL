var getJSON = function(url, successHandler, errorHandler) {
	var xhr = typeof XMLHttpRequest != 'undefined'
	? new XMLHttpRequest()
	: new ActiveXObject('Microsoft.XMLHTTP');
	xhr.open('get', url, true);
	xhr.responseType = 'json';
	xhr.onreadystatechange = function() {
		var status;
		if (xhr.readyState == 4) 
		{ // `DONE`
			status = xhr.status;
			if (status == 200) 
			{
				successHandler && successHandler(xhr.response);
			}
			else
			{
				errorHandler && errorHandler(status);
			}
		}
	};
	xhr.send();
};

var data;
getJSON('https://gl-ndi.aius.u-strasbg.fr/gitlab-org/gitlab-ce/network/master?format=json', function(d) {
	data = d;}, 
	function(status){alert('Something went wrong.');}
);

