// Initialize
const $path = require('path');
const $os = require('os');
var $SrcRoot = nw.__dirname;

$ICL_data = require($path.join($SrcRoot, './data/Data.json'));
$ICL_data.GameRoot = $path.join($path.join(nw.__dirname, '../'), $ICL_data.GameRoot);
$ICL_data.SrcRoot = $SrcRoot;

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

// Load other JS
//var $MCJSON = require($path.join($SrcRoot, './lib/MinecraftVersionsJSON.js'));
//var $Launcher = require($path.join($SrcRoot, './lib/Launcher.js'));
//var $MCProfile = require($path.join($SrcRoot, './lib/Profile.js'));
