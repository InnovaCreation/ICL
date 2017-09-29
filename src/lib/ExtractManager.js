var events = require('events');

var fs = require('fs');
var path = require('path');

function deleteRecursiveSync(fileDir) {
	if(fs.existsSync(fileDir)) {
		if(fs.statSync(fileDir).isDirectory()) {
			var files = fs.readdirSync(fileDir);
			files.forEach( function(file,index){
				deleteRecursiveSync(path.join(fileDir, file));
			});
			fs.rmdirSync(fileDir);
		} else {
			fs.unlinkSync(fileDir);
		}
	}
};

function mkdirRecursiveSync(dirname) {
	if (!fs.existsSync(dirname)) {
		mkdirRecursiveSync(path.dirname(dirname));
		fs.mkdirSync(dirname);
	}
}

function moveRecursiveSync(from, to) {
	if(fs.existsSync(from)) {
		if(fs.statSync(from).isDirectory()) {
			var files = fs.readdirSync(from);
			files.forEach( function(file,index){
				moveRecursiveSync(path.join(from, file), path.join(to, file));
			});
			fs.rmdirSync(from);
		} else {
			if (!fs.existsSync(path.dirname(to))) mkdirRecursiveSync(path.dirname(to));
			fs.renameSync(from, to);
		}
	}
}

function ExtractTask(from, to, exclude) {
	this.emmiter = new events.EventEmitter();

	if (!from || !to) {
		this.finished = true;
	} else {
		this.finished = false;

		this.exclude = exclude;
		this.from = from;
		this.to = to;
	}
}

ExtractTask.prototype.start = function() {
	if (this.finished) {
		task.emmiter.emit('finished', task);
		return this.emmiter();
	}

	var task = this;
	console.log("Extracting " + task.from);

	var unzip = require('unzip');
	var temp_path = path.join(task.to, path.basename(task.from));

	if (fs.existsSync(temp_path)) deleteRecursiveSync(temp_path);

	var stream = fs.createReadStream(task.from).pipe(
		unzip.Extract(
			{ path: temp_path }
		).on('error', err => {
			require('util').error('Error when extracting ' + task.from + ' : ' + err);
			deleteRecursiveSync(temp_path);
			task.finished = true;
			task.emmiter.emit('finished', task);
		})
	).on('close', function() {
		// Excluded files
		if (task.exclude) {
			for (i in task.exclude) deleteRecursiveSync(path.join(temp_path, task.exclude[i]));
		}
		// Move out temp dir
		var files = fs.readdirSync(temp_path);
		files.forEach( function(file,index){
			moveRecursiveSync(path.join(temp_path, file), path.join(task.to, file));
		});
		// Clean temp dir
		fs.rmdirSync(temp_path);

		task.finished = true;
		task.emmiter.emit('finished', task);
	});

	return task.emmiter;
}

module.exports.ExtractTask = ExtractTask;

function ExtractQueue() {
	this.extract_queue = [];
	this.is_queue_ended = false;

	this.emmiter = new events.EventEmitter();

	this.count = 0;
	this.finished_count = 0;
	this.finished = false;
}

module.exports.ExtractQueue = ExtractQueue;

ExtractQueue.prototype.add_task = function(from, to, exclude) {
	var queue = this;
	queue.count ++;

	var task = new ExtractTask(from, to, exclude);
	task.start().on('finished', function() {
		queue.finished_count++;
		if (queue.is_queue_ended == true) {
			queue.emmiter.emit('progress', queue.finished_count / queue.count);

			queue.finish_queue();
		}
	});

	return task.emmiter;
}

ExtractQueue.prototype.finish_queue = function() {
	if (this.finished_count == this.count) {
		console.log('Extract queue ended');
		require('util').log('Extract queue ended');
		this.finished = true;
		this.emmiter.emit('finished', this.queue);
	}
}

ExtractQueue.prototype.end_queue = function() {
	this.is_queue_ended = true;
	this.finish_queue();
	return this.emmiter;
}
