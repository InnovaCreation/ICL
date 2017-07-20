var sys = require('sys');

function MCVersion() {
	this.id = '';
	this.type = '';
	this.time = '';
	this.releaseTime = '';
	this.url = '';
}

function MCVersion(json) {
	this.id = '';
	this.type = '';
	this.time = '';
	this.releaseTime = '';
	this.url = '';

	this.is_refreshing = false;

	for (i in json) this[i] = json[i];
}

module.exports = function(icl_data, UI_window, that) {
	this.version_list = [];

	this.is_refreshing = false;

	this.UI_window = UI_window;
	this.ICL_data = icl_data;

	this.that = that;
}

module.exports.prototype.refresh_list = function(url) {
	if (this.is_refreshing) return false;

	var indicator = this.UI_window.getElementsByClassName('refresh_version_list')[0];
	this.is_refreshing = true;
	indicator.textContent = 'Refreshing...';
	indicator.disabled = true;

	var protocal = url.slice(0, url.indexOf(':'));
	if (protocal == 'http' || protocal == 'https') {
		var remote = '';
		var t = this;
		require(protocal).get(url, function(res) {
			var response_timer = setTimeout(function() {
				res.destroy();
				console.log('Response Timeout.');
				t.is_refreshing = false;
			}, 2000);

			res.on('data', function(data) {
				remote += data;
			});
			res.on('end', function(){
				if (t.is_refreshing) {
					t.version_list = JSON.parse(remote).versions;
					t.is_refreshing = false;

					t.UI_refresh_list();

					indicator.textContent = 'Refreshing List';
					indicator.disabled = false;
				}
			});
		}).on('error', function(err) {
			console.log('Error when reading remote version list: ' + err.toString());
		});

		return true;
	} else {
		this.is_refreshing = false;
		return false;
	}
}

module.exports.prototype.download_by_id = function(game_root, id) {
	sys.debug("Downloading Minecraft version " + id);

	var v = this.UI_window.getElementsByClassName('MCVersion_' + id)[0];
	var indicator = v.getElementsByClassName('MCVersionDownload')[0];
	var progress = v.getElementsByClassName('download_progressbar')[0];
	var indicator_spin = v.getElementsByClassName('uk-spinner')[0];
	indicator.textContent = 'Downloading...';
	indicator_spin.hidden = false;
	progress.hidden = false;
	indicator.disabled = true;

	var progress_A = 0.0, progress_B = 0.0;
	function change_progress() {
		progress.value = (progress_A + progress_B) * 100;
	}

	for (i in this.version_list) if (this.version_list[i].id == id) {
		var v = this.version_list[i];
		var that = this.that;

		var DM = require('./DownloadManager.js');
		var json_task = new DM.DownloadTask(
			v.url,
			require('path').join(game_root, "./gamedir/versions_descriptor/" + v.id + ".json"), this.ICL_data.CDN);
		json_task.start().on('finished', function() {
			progress_A = 0.1;
			change_progress();
			var ev = that.LoadMinecraftArgsFromJSON(v.id, true).on('finished', function(q) {
				indicator_spin.hidden = true;
				indicator.textContent = 'Download'
				indicator.disabled = false;
				progress.hidden = true;
				progress.value = 0;
			});
			ev.on('progress', (p) => {
				progress_B = 0.9 * p;
				change_progress();
			})
		});

		return true;
	}
	return false;
}

module.exports.prototype.load_version = function(original, ui_grid, version, gameroot) {
	var proto = original.cloneNode(true);

	proto.classList = ['MCVersion MCVersion_' + version.id];
	proto.getElementsByClassName('MCVersionName')[0].textContent = version.id;
	proto.getElementsByClassName('MCVersionType')[0].textContent = version.type;
	proto.getElementsByClassName('MCVersionTime')[0].textContent = version.releaseTime;
	var t = this;
	var id = version.id;
	proto.getElementsByClassName('MCVersionDownload')[0].onclick = function() {
		t.download_by_id(gameroot, id);
	};
	proto.hidden = false;

	ui_grid.appendChild(proto);
}

module.exports.prototype.UI_refresh_list = function() {
	var ui_grid = this.UI_window.getElementsByClassName('MCVersion_UI_Grid')[0];
	ui_grid.innerHTML = '';

	var proto = (this.UI_window.getElementsByClassName('MCVersion_Proto')[0]).cloneNode(true);
	for (i in this.version_list) this.load_version(proto, ui_grid, this.version_list[i], this.ICL_data.GameRoot);
}
