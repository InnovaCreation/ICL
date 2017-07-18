function LaunchArgument() {
	this.mainClass = '';
	this.asset_index = '';
	this.class_path = '';
	this.minecraftArguments = '';
}

function LoadMinecraftArgsFromJSON(file) {
	var launch_args = new LaunchArgument();

	fs = require('fs');
	var json = JSON.parse(fs.readFileSync($path.join($GameRoot, "./gamedir/versions_descriptor/" + file + ".json")));

	// Load inherit stuff
	function inherit(to) {
		if (to.inheritsFrom) {
			var json_inherit = JSON.parse(fs.readFileSync($path.join($GameRoot, "./gamedir/versions_descriptor/" + to.inheritsFrom + ".json")));
			json_inherit = inherit(json_inherit);

			for (i in to) {
				if (json_inherit[i] instanceof Array)
					json_inherit[i] = json_inherit[i].concat(to[i]);
				else
					json_inherit[i] = to[i];
			}
			return json_inherit;
		}
		return to;
	}
	json = inherit(json);

	// Fill direct accessed data from JSON
	launch_args.mainClass = json.mainClass;

	// Asset index
	launch_args.asset_index = json.assetIndex.id;

	// Fill the lib jars
	var lib_dir = $path.join($GameRoot, './gamedir/libs/');
	var lib_args = '-cp "';
	json.libraries.forEach(function(lib) {
		console.log("Get Library " + lib.name);

		var allowed = false;
		if (lib.rules) {
			lib.rules.forEach(function(rule) {
				function validateOS(classifier) {
					if ($OSType == classifier) return true;
					return false;
				}
				if (rule.action == 'allow') {
					if (rule.os) {
						if (validateOS(rule.os.name)) allowed = true;
					} else allowed = true;
				} else if (rule.action == 'disallow') {
					if (rule.os) {
						if (validateOS(rule.os.name)) allowed = true;
					} else allowed = false;
				}
			});
		} else allowed = true;

		if (allowed) {
			var artifact = JSONLibGetArtifact(lib);

			console.log("Path:" + artifact.path);
			lib_args += lib_dir + artifact.path + ":"
		}
	});
	// Add main jar to those libs
	var versions_dir = $path.join($GameRoot, './gamedir/versions/');
	var version_id = json.jar ? json.jar : file;
	lib_args += versions_dir + version_id + '.jar"'
	// Output args
	launch_args.class_path = lib_args;
	launch_args.minecraftArguments = json.minecraftArguments;

	return launch_args;
}

function Artifact() {
	this.path = '';
}

function JSONLibGetArtifact(lib) {
	if (!lib.downloads) {
		var artifact = new Artifact();
		var name_strings = lib.name.slice(0, lib.name.indexOf(':')).split('.');
		//lib.name.split(/[.:]+/);

		var path_string = '';
		for (i in name_strings) path_string = $path.join(path_string, name_strings[i] + '/');

		name_strings = lib.name.slice(lib.name.indexOf(':'), lib.name.length).split(':');
		for (i in name_strings) path_string = $path.join(path_string, name_strings[i] + '/');
		path_string = $path.join(path_string, name_strings[1] + '-' + name_strings[2] + '.jar');

		artifact.path = path_string;

		return artifact;
	} else if (lib.downloads.classifiers)
		return lib.downloads.classifiers[lib.natives[$OSType]];
	else
		return lib.downloads.artifact;
}
