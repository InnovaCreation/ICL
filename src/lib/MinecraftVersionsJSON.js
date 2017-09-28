var event = require('events');

function LaunchArgument() {
	this.mainClass = '';
	this.asset_index = '';
	this.class_path = '';
	this.minecraftArguments = '';
}

function LoadMinecraftArgsFromJSON(file, extract_flag) {
	var launch_args = new LaunchArgument();

	var fs = require('fs');
	var json_file = $path.join($ICL_data.GameRoot, "./gamedir/versions_descriptor/" + file + ".json");
	if (!fs.existsSync(json_file)) return 200;
	var json = JSON.parse(fs.readFileSync(json_file));

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
	var EM = require('./lib/ExtractManager.js');
	var downloads, extracts;
	if (extract_flag) {
		downloads = new DM.DownloadQueue();
		extracts = new EM.ExtractQueue();
	}

	var emmiter;
	if (extract_flag) emmiter = new event.EventEmitter();

	json.libraries.forEach(function(lib) {
		console.log("Get Library " + lib.name);

		// Load Rules
		var allowed = false;
		function validateOS(classifier) {
			if ($OSType == classifier) return true;
			return false;
		}
		if (lib.rules) {
			lib.rules.forEach(function(rule) {
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
			lib_args += $path.join(lib_dir, artifact.path) + (validateOS("windows") ? ";" : ":");

			// Examine library's presence & download
			if (extract_flag) {
				var lib_physical = $path.join(lib_dir, artifact.path);

				if (!fs.existsSync(lib_physical)) {
					console.log('Downloading ' + artifact.url);
					download_end = false;
					downloads.add_task(artifact.url, lib_physical).on('finished', decompress);
				} else if (artifact.size > 0 && fs.statSync(lib_physical).size != artifact.size) {
					console.log('Actual size ' + fs.statSync(lib_physical).size + ' artifact expected ' + artifact.size);
					console.log('Size mismatch, redownload..');
					download_end = false;
					fs.unlinkSync(lib_physical);
					downloads.add_task(artifact.url, lib_physical).on('finished', decompress);
				} else
					decompress();

				function decompress() {
					if (lib.extract) {
						var from = $path.join(lib_dir, artifact.path);
						var to = $path.join($ICL_data.GameRoot, './gamedir/versions/' + file + '-natives/')
						extracts.add_task(from, to);
					}
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

		var progressD = 0.0, progressE = 0.0;
		var evd = downloads.end_queue().on('finished', function() {
			if (downloads.finished && extracts.finished) emmiter.emit('finished');
		});
		evd.on('progress', (p) => { progressD = p * 0.8; emmiter.emit('progress', progressD + progressE) });

		var eve = extracts.end_queue().on('finished', function() {
			if (downloads.finished && extracts.finished) emmiter.emit('finished');
		});
		eve.on('progress', (p) => { progressE = p * 0.2; emmiter.emit('progress', progressD + progressE) });

		// End queue and wait for everything to be done.
		// In this scenerio, a emitter should be returned.
		return emmiter;
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
