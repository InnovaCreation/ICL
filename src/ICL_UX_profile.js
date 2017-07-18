function edit(profile_window) {
	var profile_name_element = profile_window.children[0].children[0];
	$p.LoadFromJSON(profile_name_element.textContent);
	refresh_profile_blob();

	var modal = UIkit.modal(document.getElementById('game_profile_settings_window'));
	modal.toggle();
}

function launch(profile_window) {
	var p = new Profile();
	var profile_name_element = profile_window.children[0].children[0];
	p.LoadFromJSON(profile_name_element.textContent);

	var launch_args = LoadMinecraftArgsFromJSON(p.mc_version_string);

	var java_path = p.java_path;
	var jvm_args = p.GenerateJVMArgs($gp);

	var minecraftArguments = p.GenerateMinecraftArguments($gp, launch_args);

	var launch_cmd = AssemblyLaunchCMD(
		java_path,
		jvm_args,
		launch_args.class_path,
		launch_args.mainClass,
		minecraftArguments
	);

	console.log(launch_cmd);

	LaunchGame(launch_cmd);
}
