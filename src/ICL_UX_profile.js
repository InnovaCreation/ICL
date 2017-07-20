function edit(profile_window) {
	var profile_name_element = profile_window.getElementsByClassName('ModelProfileName')[0];
	$p.LoadFromJSON(profile_name_element.textContent);
	refresh_profile_blob();

	var modal = UIkit.modal(document.getElementById('game_profile_settings_window'));
	modal.toggle();
}

function launch(profile_window) {
	var p = new Profile();
	var profile_name_element = profile_window.getElementsByClassName('ModelProfileName')[0];

	var indicator = profile_window.getElementsByClassName('ModelProfileLaunch')[0];
	indicator.disabled = true;
	indicator.textContent = 'Launching...';

	p.LoadFromJSON(profile_name_element.textContent, false);

	var launch_args = LoadMinecraftArgsFromJSON(p.mc_version_string, false);

	var java_path = p.java_path;
	var jvm_args = p.GenerateJVMArgs($gp);

	var minecraftArguments = p.GenerateMinecraftArguments($gp, launch_args);

	var launch_cmd = AssembleLaunchCMD(
		java_path,
		jvm_args,
		launch_args.class_path,
		launch_args.mainClass,
		minecraftArguments
	);

	console.log(launch_cmd);

	var ev = LaunchGame(launch_cmd)
	indicator.textContent = 'Running';

	ev.on('game_exit', function(args) {
		indicator.textContent = 'Launch';
		indicator.disabled = false;
	});
}
