//class

function LoadMinecraftArgsFromJSON(file) {
	var json = require(file);
				
	// Automatically fill in java (though it could be javaw, or others)
	document.getElementById('java_path').value = 'java';
	
	// Fill direct accessed data from JSON
	document.getElementById('mainClass').value = json.mainClass;
				
	// Fill the lib jars
	var lib_dir = $path.join($GameRoot, './gamedir/libs/');
	var lib_args = '-cp "';
	json.libraries.forEach(function(lib) {
		console.log("Get Library " + lib.name);
					
		var artifact = JSONLibGetArtifact(lib);
					
		console.log("Path:" + artifact.path);						
		lib_args += lib_dir + artifact.path + ":"
	});
	// Add main jar to those libs
	var versions_dir = $path.join($GameRoot, './gamedir/versions/');
	var version_id = '1.11.2';
	lib_args += versions_dir + version_id + '.jar"'
	// Output args
	document.getElementById('class_path').value = lib_args;
}
			
function JSONLibGetArtifact(lib) {
	if (lib.downloads.classifiers)
		return lib.downloads.classifiers[lib.natives[$OSType]];
	else
		return lib.downloads.artifact;
}
