// ==============================================
//  Instance Profile Class
// ==============================================
// Constructor
function Profile() {
	this.profile_name = 'Default'

	this.java_path = 'java';
	this.custom_jvm_args = '';
	this.mc_version_string = '';
	this.custom_minecraft_args = '';

	this.height = 0;
	this.width = 0;
}

Profile.prototype.GenerateJVMArgs = function(gp) {
	var args = '-Xincgc -XX:+UseConcMarkSweepGC -XX:+CMSIncrementalMode -XX:-UseAdaptiveSizePolicy -XX:-OmitStackTraceInFastThrow'

	// Max & Min memory
	args += ' -Xmn' + gp.minMemory.toString() + 'm';
	args += ' -Xmx' + gp.maxMemory.toString() + 'm';

	// Librarys (natives)
	var natives_dir = $path.join($GameRoot, './gamedir/versions/' + this.mc_version_string + '-natives');
	args += ' "-Djava.library.path=' + natives_dir + '"';

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

Profile.prototype.GenerateMinecraftArguments = function(gp, launch_args) {
	var auth_player_name = gp.player_id;
	var version_name = '"ICL 0.X"';
	var game_directory = '"' + $path.join($GameRoot, './.minecraft') + '"';
	var assets_root = '"' + $path.join($GameRoot, './.minecraft/assets') + '"';
	var assets_index_name = launch_args.asset_index;
	var auth_uuid = gp.uuid;
	var auth_access_token = gp.uuid;
	var user_type = 'Legacy';
	var version_type = '"ICL 0.X"';

	var args = launch_args.minecraftArguments;

	args = args.replace("${auth_player_name}", auth_player_name);
	args = args.replace("${version_name}", version_name);
	args = args.replace("${game_directory}", game_directory);
	args = args.replace("${assets_root}", assets_root);
	args = args.replace("${assets_index_name}", assets_index_name);
	args = args.replace("${auth_uuid}", auth_uuid);
	args = args.replace("${auth_access_token}", auth_access_token);
	args = args.replace("${user_type}", user_type);
	args = args.replace("${version_type}", version_type);

	if (this.height > 0) args += ' -height ' + this.height.toString();
	if (this.width > 0) args += ' -width ' + this.width.toString();

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
	fs = require('fs');
	var json = JSON.parse(fs.readFileSync($path.join($GameRoot, profile_name + ".profile.json")));

	for (var i in json) this[i] = json[i];
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

	this.uuid = uuidv4();
}

GlobalProfile.prototype.StoreJSON = function() {
	var string = JSON.stringify(this);

	var fs = require('fs');
	fs.writeFile(
		$path.join($GameRoot, "GlobalProfile.json"),
		string
	);
}

GlobalProfile.prototype.LoadFromJSON = function() {
	fs = require('fs');
	var json = JSON.parse(fs.readFileSync($path.join($GameRoot, "GlobalProfile.json")));

	for (var i in json) this[i] = json[i];
}

//module.exports.GlobalProfile = GlobalProfile;
