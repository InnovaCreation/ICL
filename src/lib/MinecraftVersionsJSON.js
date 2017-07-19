function LaunchArgument() {
	this.mainClass = '';
	this.asset_index = '';
	this.class_path = '';
	this.minecraftArguments = '';
}

function LoadMinecraftArgsFromJSON(file, extract_flag) {
	var launch_args = new LaunchArgument();

	var fs = require('fs');
	var json = JSON.parse(fs.readFileSync($path.join($ICL_data.GameRoot, "./gamedir/versions_descriptor/" + file + ".json")));

	// Load inherit stuff
	function inherit(to) {
		if (to.inheritsFrom) {
			var json_inherit = JSON.parse(fs.readFileSync($path.join($ICL_data.GameRoot, "./gamedir/versions_descriptor/" + to.inheritsFrom + ".json")));
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
	var lib_dir = $path.join($ICL_data.GameRoot, './gamedir/libs/');
	var lib_args = '-cp "';

	// Prepare download queue
	var DM = require('./lib/DownloadManager.js');
	var downloads;
	if (extract_flag) downloads = new DM.DownloadQueue();

	json.libraries.forEach(function(lib) {
		console.log("Get Library " + lib.name);

		// Load Rules
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

		// Load allowed
		if (allowed) {
			// Add artifact
			var artifact = JSONLibGetArtifact(lib);

			console.log("Path:" + artifact.path);
			lib_args += $path.join(lib_dir, artifact.path) + ":";

			// Examine library's presence & download
			if (extract_flag) {
				var lib_physical = $path.join(lib_dir, artifact.path);

				if (!fs.existsSync(lib_physical)) {
					console.log('Downloading ' + artifact.url);
					downloads.add_task(artifact.url, lib_physical).on('finished', decompress);
				} else if (artifact.size > 0 && fs.statSync(lib_physical).size != artifact.size) {
					console.log('Actual size ' + fs.statSync(lib_physical).size + ' artifact expected ' + artifact.size);
					console.log('Size mismatch, redownload..');
					fs.unlinkSync(lib_physical);
					downloads.add_task(artifact.url, lib_physical).on('finished', decompress);
				} else
					decompress();
			}

			function decompress() {
				// Decompress natives
				if (lib.extract) {
					console.log("Extracting " + lib.name + " from " + artifact.path);

					var unzip = require('unzip');
					var path = $path.join($ICL_data.GameRoot, './gamedir/versions/' + file + '-natives/');
					var temp_path = $path.join(path, lib.name);

					var stream = fs.createReadStream($path.join(lib_dir, artifact.path)).pipe(
						unzip.Extract(
							{ path: temp_path }
						)
					).on('close', function() {
						// Excluded files
						if (lib.extract.exclude) {
							// rm -rf
							function deleteRecursive(path) {
								if(fs.existsSync(path)) {
									if(fs.statSync(path).isDirectory()) {
										var files = fs.readdirSync(path);
										files.forEach( function(file,index){
											deleteRecursive($path.join(path, file));
										});
										fs.rmdirSync(path);
									} else {
										fs.unlinkSync(path);
									}
								}
							};
							// Perform actual remove
							for (i in lib.extract.exclude) deleteRecursive($path.join(temp_path, lib.extract.exclude[i]));

							// Move out temp dir
							function moveSync(from, to) {
								if (fs.statSync(from).isDirectory()) {
									var files = fs.readdirSync(temp_path);
									files.forEach( function(file,index) {
										moveSync($path.join(from, file), $path.join(to, file))
									});
								}
								fs.renameSync(from, to);
							}
							var files = fs.readdirSync(temp_path);
							files.forEach( function(file,index){
								moveSync($path.join(temp_path, file), $path.join(path, file));
							});

							// Clean temp dir
							fs.rmdirSync(temp_path);
						}
					});
				}
			}
		}
	});
	// Add main jar to those libs
	var versions_dir = $path.join($ICL_data.GameRoot, './gamedir/versions/');
	var version_id = json.jar ? json.jar : file;
	lib_args += versions_dir + version_id + '.jar"'
	// Output args
	launch_args.class_path = lib_args;
	launch_args.minecraftArguments = json.minecraftArguments;

	if (extract_flag) {
		// Download main jar
		downloads.add_task(
			json.downloads.client.url,
			$path.join($ICL_data.GameRoot, './gamedir/versions/' + json.id + '.jar')
		);

		// End queue and wait for everything to be done.
		// In this scenerio, a emitter should be returned.
		return downloads.end_queue();
	}

	json = null;

	return launch_args;
}

function Artifact() {
	this.path = '';
}

function JSONLibGetArtifact(lib) {
	function getDirect(lib) {
			var name_strings = lib.name.slice(0, lib.name.indexOf(':')).split('.');
			//lib.name.split(/[.:]+/);

			var path_string = '';
			for (i in name_strings) path_string = $path.join(path_string, name_strings[i] + '/');

			name_strings = lib.name.slice(lib.name.indexOf(':'), lib.name.length).split(':');
			for (i in name_strings) path_string = $path.join(path_string, name_strings[i] + '/');
			path_string = $path.join(path_string, name_strings[1] + '-' + name_strings[2]);
			return path_string;
	}

	var artifact;
	if (!lib.downloads)
		artifact = new Artifact();
	else if (lib.downloads.classifiers && lib.natives && lib.downloads.classifiers[lib.natives[$OSType]])
		artifact = lib.downloads.classifiers[lib.natives[$OSType]];
	else if (lib.downloads.artifact)
		artifact = lib.downloads.artifact;
	else
		artifact = new Artifact();

	artifact.path = getDirect(lib);
	if (lib.natives) {
		artifact.path += '-' + lib.natives[$OSType];
	}
	var path_omit_jar = artifact.path;
	artifact.path += '.jar';

	if (!lib.downloads) {
		var name = lib.name;
		if (name.includes("scala-swing") || name.includes("scala-xml") || name.includes("scala-parser-combinators")) {
			artifact.url = "http://ftb.cursecdn.com/FTB2/maven/" + artifact.path;
		} else if (name.includes("typesafe") || name.includes("scala")) {
			artifact.url = "http://maven.aliyun.com/nexus/content/groups/public/" + artifact.path;
		} else if (name.includes("net.minecraft") && !name.includes("forge")) {
			artifact.url = "https://libraries.minecraft.net/" + artifact.path;
		} else if (name.includes("lzma"))
			artifact.url = "https://repo.spongepowered.org/maven/" + artifact.path;
		else if (lib.url)
			artifact.url = lib.url + artifact.path;
		else
			artifact.url = "http://maven.aliyun.com/nexus/content/groups/public/" + artifact.path;

		if (name.includes("net.minecraftforge:forge"))
			artifact.url = lib.url + path_omit_jar + '-universal.jar';

		artifact.size = 0;
	}

	return artifact;
}
