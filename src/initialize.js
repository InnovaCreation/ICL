// Initialize
const $path = require('path');
const $os = require('os');
var $GameRoot = $path.join($path.join(nw.__dirname, '../'), './Game');
var $SrcRoot = nw.__dirname;
var $OSType;
switch ($os.platform()) {
	case 'linux' :
		$OSType = 'linux';
		break;
	case 'darwin' :
		$OSType = 'osx';
		break;
	case 'win32' :
		$OSType = 'windows';
}

$ICL_Version = '0.0.1'

// Load other JS
//var $MCJSON = require($path.join($SrcRoot, './lib/MinecraftVersionsJSON.js'));
//var $Launcher = require($path.join($SrcRoot, './lib/Launcher.js'));
//var $MCProfile = require($path.join($SrcRoot, './lib/Profile.js'));
