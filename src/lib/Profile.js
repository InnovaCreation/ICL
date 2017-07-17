// ==============================================
//  Instance Profile Class
// ==============================================
// Constructor
function Profile() {
	this.java_path = '';
	this.custom_jvm_args = '';
	this.mc_version_string = '';
	this.custom_minecraft_args = '';
	this.native_path = '';
	
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

Profile.prototype.GenerateMinecraftArguments = function(gp) {
	var args = '--username ' + gp.player_id
	
	args += ' --version "ICL 0.X"'
	args += ' --gameDir "' + $path.join($GameRoot, './.minecraft') + '"'
	args += ' --assetsDir "' + $path.join($GameRoot, './.minecraft/assets') + '"'
	args += ' --assetIndex 1.11 --uuid f81253f5efd31d0effe85681d0ab63fc --accessToken f81253f5efd31d0effe85681d0ab63fc --userType Legacy'
	
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
