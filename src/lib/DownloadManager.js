var events = require('events');

function DownloadTask(url, to) {
	this.finished = false;
	this.emmiter = new events.EventEmitter();

	this.url = url;
	this.to = to;
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
}

module.exports.DownloadQueue = DownloadQueue;

DownloadQueue.prototype.add_task = function(url, to) {
	var queue = this;
	queue.count ++;

	var task = new DownloadTask(url, to);
	task.start().on('finished', function() {
		if (queue.is_queue_ended) {
			queue.finished_count++;
			queue.emmiter.emit('progress', queue.finished_count / queue.count);

			var real_end = true;
			for (i in queue.download_queue) {
				if (!queue.download_queue[i].finished) {
					real_end = false;
					break;
				}
			}

			if (real_end) {
				console.log('Download queue ended');
				queue.emmiter.emit('finished', queue);
			}
		}
	});

	return task.emmiter;
}

DownloadQueue.prototype.end_queue = function() {
	this.is_queue_ended = true;
	return this.emmiter;
}
