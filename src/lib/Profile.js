// ==============================================
//  Instance Profile Class
// ==============================================
// Constructor
function Profile() {
	this.profile_name = 'Default'

	this.java_path = '';
	this.custom_jvm_args = '';
	this.mc_version_string = '';
	this.custom_minecraft_args = '';
	this.native_path = '';
	
	this.uuid = uuidv4();
	
	this.height = 0;
	this.width = 0;
}

Profile.prototype.GenerateJVMArgs = function(gp) {
	var args = '-Xincgc -XX:-UseAdaptiveSizePolicy -XX:-OmitStackTraceInFastThrow'
	
	// Max & Min memory
	args += ' -Xmn' + gp.minMemory.toString() + 'm';
	args += ' -Xmx' + gp.maxMemory.toString() + 'm';
	
	// Librarys (natives)
	args += ' "-Djava.library.path=' + this.native_path + '"';
	
	// FML defaults
	args += ' -Dfml.ignoreInvalidMinecraftCertificates=true -Dfml.ignorePatchDiscrepancies=true';
	
	// JAVA User Home
	args += ' "-Duser.home=' + $GameRoot + '"';
	
	// Custom flags
	args += this.custom_jvm_args;
	
	return args;
}

// UUID v4 from Chrome developers
function uuidv4() {
	return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
		(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
	)
}

Profile.prototype.GenerateMinecraftArguments = function(gp) {
	var args = '--username ' + gp.player_id
	
	args += ' --version "ICL 0.X"'
	args += ' --gameDir "' + $path.join($GameRoot, './.minecraft') + '"'
	args += ' --assetsDir "' + $path.join($GameRoot, './.minecraft/assets') + '"'
	args += ' --assetIndex 1.11 --uuid ' + this.uuid + ' --accessToken ' + this.uuid;
	
	args += ' --userType Legacy'
	args += ' --versionType "ICL 0.X"';
	
	if (this.height > 0) {
		args += ' -height ' + this.height.toString();
	}
	if (this.width > 0) {
		args += ' -width ' + this.width.toString();
	}
	
	// Custom flags
	args += this.custom_minecraft_args;
	
	return args;
}

Profile.prototype.StoreJSON = function() {
	var string = JSON.stringify(this);
	
	var fs = require('fs');
	fs.writeFile(
		$path.join($GameRoot, this.profile_name + ".profile.json"), 
		string
	);
}

Profile.prototype.LoadFromJSON = function(profile_name) {
	var json = require($path.join($GameRoot, profile_name + ".profile.json"));
	
	this.profile_name = json.profile_name;

	this.java_path = json.java_path;
	this.custom_jvm_args = json.custom_jvm_args;
	this.mc_version_string = json.mc_version_string;
	this.custom_minecraft_args = json.custom_minecraft_args;
	this.native_path = json.native_path;
	
	this.uuid = json.uuid;
	
	this.height = json.height;
	this.width = json.width;
}

//module.exports.Profile = Profile;

// ==============================================
//  Global Profile Class
// ==============================================
// Constructor
function GlobalProfile() {
	//this.auth_method = plain // Not implemented
	this.player_id = '';
	this.maxMemory = Math.floor($os.freemem / 1024 / 1024 / 512) * 512;
	this.minMemory = Math.floor(this.maxMemory / 8);
}

GlobalProfile.prototype.StoreToJSON = function() {
	
}

//module.exports.GlobalProfile = GlobalProfile;
