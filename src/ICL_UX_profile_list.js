load_p.onclick = refresh_profile;

function refresh_profile() {
	var fs = require('fs');
	fs.readdirSync($GameRoot).forEach(
		function(f,index) {
			if(!fs.statSync($path.join($GameRoot, f)).isDirectory()){
				var index = f.indexOf('.profile.json');
				if (index > 0) {
					var json_name = f.slice(0, index);
					load_profile(json_name);
				}
			}
		})
}

function load_profile(name) {
	var model = document.getElementById('model_profile');
	var cloned = model.cloneNode(true);

	cloned.id = 'profile_' + name;
	cloned.children[0].children[0].textContent = name;
	cloned.children[0].children[1].onclick = function() {edit(cloned);};
	cloned.children[0].children[2].onclick = function() {launch(cloned);};

	document.getElementById('profiles_window_grid').appendChild(cloned);

	cloned.hidden = false;
}

create_p.onclick = function() {
	var name = document.getElementById('load_profile_name').value;
	$p = new Profile();
	$p.profile_name = name;
	$p.StoreJSON();
}
