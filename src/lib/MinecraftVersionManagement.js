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

module.exports = function(icl_data) {
	this.version_list = [];

	this.is_refreshing = false;
}

module.exports.prototype.refresh_list = function(url) {
	if (this.is_refreshing) return false;

	this.is_refreshing = true;

	var protocal = url.slice(0, url.indexOf(':'));
	if (protocal == 'http' || protocal == 'https') {
		var remote = '';
		var t = this;
		require(protocal).get(url, function(res) {
			res.on('data', function(data) {
				remote += data;
			});
			res.on('end', function(){
				t.version_list = JSON.parse(remote).versions;
				t.is_refreshing = false;
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
	for (i in this.version_list) if (this.version_list[i].id == id) {
		var v = this.version_list[i];
		var protocal = v.url.slice(0, v.url.indexOf(':'));
		if (protocal == 'http' || protocal == 'https') {
			var remote = '';
			var file_name = v.id + ".json";
			require(protocal).get(v.url, function(res) {
				res.on('data', function(data) {
					remote += data;
				});
				res.on('end', function(){
					var fs = require('fs');
					fs.writeFile(
						require('path').join(game_root, "./gamedir/versions_descriptor/" + file_name),
						remote
					);
				});
			}).on('error', function(err) {
				console.log('Error when reading remote version list: ' + err.toString());
			});

			return true;
		} else return false;
	}
	return false;
}
