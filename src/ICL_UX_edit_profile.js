var $p = new Profile();

function refresh_profile_blob() {
	document.getElementById('profile_name').value = $p.profile_name;
	document.getElementById('java_path').value = $p.java_path;
	document.getElementById('custom_jvm_args').value = $p.custom_jvm_args;
	document.getElementById('mc_version_string').value = $p.mc_version_string;
	document.getElementById('custom_minecraft_args').value = $p.custom_minecraft_args;

	document.getElementById('height').value = $p.height;
	document.getElementById('width').value = $p.width;

	document.getElementById('apply_profle').onclick = apply_profile_blob;
}

refresh_profile_blob();

function apply_profile_blob() {
	$p.profile_name = document.getElementById('profile_name').value;
	$p.java_path = document.getElementById('java_path').value;
	$p.custom_jvm_args = document.getElementById('custom_jvm_args').value;
	$p.mc_version_string = document.getElementById('mc_version_string').value;
	$p.custom_minecraft_args = document.getElementById('custom_minecraft_args').value;

	$p.height = document.getElementById('height').value;
	$p.width = document.getElementById('width').value;

	$p.StoreJSON();
}
