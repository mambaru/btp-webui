App.hostConfig = {
	'127.0.0.1' : 'btp01'
};

App.groupConfig = {
	'services': [
		{
			title: 'Php Time',
			items: [ '^SCRIPT_.+' ],
			replace: 'SCRIPT_'
		}
	]
};
