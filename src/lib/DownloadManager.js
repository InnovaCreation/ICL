var events = require('events');

function DownloadTask(url, to, CDN) {
	this.emmiter = new events.EventEmitter();

	if (!url || !to) {
		this.finished = true;
	} else {
		this.finished = false;

		if (CDN) {
			var url_cdn = url;

			for (i in CDN.source[CDN.default]) {
				var rule = CDN.source[CDN.default][i];
				url_cdn = url_cdn.replace(rule.src, rule.cdn);
			}

			this.url = url_cdn;
		} else {
			this.url = url;
		}

		this.to = to;
	}
}

var fs = require('fs');
var path = require('path');

function mkdirRecursiveSync(dirname) {
	if (!fs.existsSync(dirname)) {
		mkdirRecursiveSync(path.dirname(dirname));
		fs.mkdirSync(dirname);
	}
}

DownloadTask.prototype.start = function() {
	if (this.finished) {
		task.emmiter.emit('finished', task);
		return this.emmiter();
	}

	var task = this;

	var protocal = task.url.slice(0, task.url.indexOf(':'));
	if (protocal == 'http' || protocal == 'https') {
		require(protocal).get(task.url, function(res) {
			mkdirRecursiveSync(path.dirname(task.to));
			var file = fs.createWriteStream(task.to);
			res.on('data', (data) => {file.write(data);});

			res.on('end', function() {
				file.end();
				file.on('finish', function(){
					task.finished = true;
					task.emmiter.emit('finished', task);
				})
			});
		}).on('error', function(err) {
			console.log('Error when downloading: ' + err.toString());
		});
	}

	return this.emmiter;
}

module.exports.DownloadTask = DownloadTask;

function DownloadQueue() {
	this.download_queue = [];
	this.is_queue_ended = false;

	this.emmiter = new events.EventEmitter();

	this.count = 0;
	this.finished_count = 0;
	this.finished = false;

	this.CDN = require('../data/Data.json').CDN;
}

module.exports.DownloadQueue = DownloadQueue;

DownloadQueue.prototype.add_task = function(url, to) {
	var queue = this;
	queue.count ++;

	var task = new DownloadTask(url, to, this.CDN);
	task.start().on('finished', function() {
		queue.finished_count++;
		if (queue.is_queue_ended == true) {
			queue.emmiter.emit('progress', queue.finished_count / queue.count);

			queue.finish_queue();
		}
	});

	return task.emmiter;
}

DownloadQueue.prototype.finish_queue = function() {
	if (this.finished_count == this.count) {
		console.log('Download queue ended');
		require('util').log('Download queue ended');
		this.finished = true;
		this.emmiter.emit('finished', this.queue);
	}
}

DownloadQueue.prototype.end_queue = function() {
	this.is_queue_ended = true;
	this.finish_queue();
	return this.emmiter;
}
