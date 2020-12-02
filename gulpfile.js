const { src, dest, series } = require('gulp');
const rename = require("gulp-rename");
const uglify = require('gulp-uglify-es').default;

function lint(cb) {

}


function buildClasses(cb) {
	src(['assets/favicon.png', 'assets/index.html'])
		.pipe(dest('dist/'));

	src(['assets/js/classes/*.js', 'assets/js/*.js'])
		.pipe(uglify())
		.pipe(rename(function(path){
			path.basename += '-min'
		}))
		.pipe(dest('dist/js/'));

	src(['assets/js/Cesium-1.75/Build/Cesium/**'])
		.pipe(dest('dist/js/Cesium'));

	src('assets/img/**')
		.pipe(dest('dist/img/'));

	src('assets/css/**')
		.pipe(dest('dist/css/'))

	cb();
}

// exports.default = series(lint, uglify, build);
exports.default = series(buildClasses);
