var events = require('events');

function LaunchGame(args) {
	var sys = require('sys');
	var game = require('child_process').exec(args, {
		// detachment and ignored stdin are the key here:
		detached: true,
		stdio: [ 'ignore', 1, 2 ],
	});

	var emmiter = new events.EventEmitter();

	game.unref();
	game.stdout.on('data', function(data) {
		console.log("[Game Output]" + data.toString());
	});

	game.stderr.on('data', function(data) {
		console.log("[Game Error]" + data.toString());
	});

	game.on('exit', function(code) {
		console.log("Game exited with code " + code.toString());
		emmiter.emit('game_exit', args);
	});

	return emmiter;
}

function AssembleLaunchCMD(
	java_path,
	jvm_args,
	class_path,
	mainClass,
	minecraftArguments)
{
	return java_path  + " "
	     + jvm_args   + " "
	     + class_path + " "
	     + mainClass  + " "
	     + minecraftArguments;
}

//module.exports.LaunchGame = LaunchGame;
//module.exports.AssembleLaunchCMD = AssembleLaunchCMD;
