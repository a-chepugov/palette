'use strict';
var gulp = require('gulp');

var ProjectDir = 'public_html';

function onError(done, err) {  // Заглушка для обработки ошибок
	if (this && this.seq) console.log(this.seq);
	if (err) {
		console.log(err);
		done(err);
	}
}

// Задание по-умолчанию =============================

gulp.task('default',
	['connect'],
	function () {
		gulp.watch(ProjectDir + '/**/*.jade', ['watch_jade']);
		gulp.watch(ProjectDir + '/**/*.html', ['watch_html']);
		gulp.watch(ProjectDir + '/**/*.styl', ['watch_styl']);
		//gulp.watch(ProjectDir + '/**/*.css', ['watch_css']);
		gulp.watch(ProjectDir + '/**/*.js', ['watch_js']);
		gulp.watch([ProjectDir + '/**/*.{jpg,jpeg,png,svg}'], ['reloadconnect']);
	});

// Пакетные задания =============================

gulp.task('watch_jade', function () {
	var e = onError.bind(this, arguments[0]);

	var src = [ProjectDir + '/jade/**/*.jade', '!' + ProjectDir + '/jade/**/_*.jade'];
	var dst = ProjectDir + '/';

	return gulp.src(src)
		.pipe(require('gulp-jade')({pretty: true}).on('error', e))
		.pipe(gulp.dest(dst));
});

gulp.task('watch_html', function () {
	var e = onError.bind(this, arguments[0]);
	var rev = require('gulp-rev-append');
	var connect = require('gulp-connect');

	return gulp.src(ProjectDir + '/**/*.html')
		.pipe(rev().on('error', e))
		.pipe(connect.reload().on('error', e))
});

gulp.task('watch_styl', function () {
	var e = onError.bind(this, arguments[0]);
	var stylus = require('gulp-stylus');
	var sourcemaps = require('gulp-sourcemaps');

	return gulp.src(ProjectDir + '/**/main.styl')
		.pipe(sourcemaps.init())
		.pipe(stylus({'linenos': true, 'include css': true}).on('error', e))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(ProjectDir))
});

gulp.task('watch_css', function () {
	var e = onError.bind(this, arguments[0]);
	var autoprefixer = require('gulp-autoprefixer');
	var cssnano = require('gulp-cssnano');
	var rename = require('gulp-rename');
	var rev = require('gulp-rev-append');
	var connect = require('gulp-connect');

	return gulp.src(ProjectDir + '/**/*.css')
		//.pipe(autoprefixer().on('error', e))
		//.pipe(cssnano().on('error', e))
		//.pipe(rename('main.min.css').on('error', e))
		//.pipe(rev().on('error', e))
		//.pipe(gulp.dest(ProjectDir))
		.pipe(connect.reload().on('error', e))
});

gulp.task('watch_js', function () {
	var e = onError.bind(this, arguments[0]);
	var connect = require('gulp-connect');

	return gulp.src(ProjectDir + '/**/*.js')
		.pipe(rev().on('error', e))
		.pipe(connect.reload().on('error', e))
});

// Заготовки заданий =============================

gulp.task('connect', function () {
	var connect = require('gulp-connect');

	return ( connect.server({
		root: ProjectDir + '',
		livereload: true
	}));
});

gulp.task('reloadconnect', function () {
	var connect = require('gulp-connect');

	return connect.reload();
});

gulp.task('jade', (function (success, error) {
	var src = [ProjectDir + '/jade/**/*.jade', '!' + ProjectDir + '/jade/**/_*.jade'];
	var dst = ProjectDir + '/';

	return gulp.src(src)
		.pipe(require('gulp-jade')({pretty: true}))
		.pipe(gulp.dest(dst));
}));

gulp.task('csscomb', function (success, error) {
	var src = [ProjectDir + '/**/*.scss', '!' + ProjectDir + '/**/mixins/*.scss'];
	var dst = ProjectDir;

	return gulp.src(src)
		.pipe(require('gulp-csscomb')().on('error', error))
		.pipe(gulp.dest(dst));
});

gulp.task('autoprefixer', function () {
	var src = ProjectDir + '/**/*.css';
	var dst = ProjectDir;

	return gulp.src(src)
		.pipe(require('gulp-autoprefixer')({
			browsers: ['last 15 versions', '> 1%', 'ie 8'],
			cascade: false
		})).on('error', error)
		.pipe(require('gulp-rename')(
			{
				suffix: ".withPrefixes"
			})).on('error', error)
		.pipe(gulp.dest(dst));
});

gulp.task('cssnano', function (success, error) {
	var sourcemaps = require('gulp-sourcemaps');
	var src = ProjectDir + '/**/*.withPrefixes.css';
	var dst = ProjectDir;

	return gulp.src(src)
		.pipe(sourcemaps.init().on('error', error))
		.pipe(require('gulp-cssnano')().on('error', error))
		.pipe(require('gulp-rename')(
			{
				basename: "main",
				suffix: ".min"
			})).on('error', error)
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(dst));
});

gulp.task('uncss', function () {
	var uncss = require('gulp-uncss');
	var src = ProjectDir + '/**/*.min.css';
	var dst = ProjectDir;

	return gulp.src(src)
		.pipe(uncss({
			html: [ProjectDir + '/*.html', 'alex/**/*.htm']
		}))
		.pipe(gulp.dest(dst));
});

gulp.task('csslint', function () {
	var csslint = require('gulp-csslint');
	var src = ProjectDir + '/**/*.css';

	return gulp.src(src)
		.pipe(csslint())
		.pipe(csslint.reporter('text'));
});



gulp.task('rev-append', function () {
	var rev = require('gulp-rev-append');
	var src = ProjectDir + '/**/*.html';
	var dst = ProjectDir;

	return gulp.src(src)
		.pipe(rev())
		.pipe(gulp.dest(dst));
});

gulp.task('wiredep', function () {
	var wiredep = require('wiredep').stream;
	var src = ProjectDir + '/**/*.html';
	var dst = ProjectDir;

	return gulp.src(src)
		.pipe(wiredep({
			optional: 'devDependencies',
			directory: ProjectDir + '/bower_components',
			goes: 'here'
		}))
		.pipe(gulp.dest(dst));
});

gulp.task('shell', function () {
	var shell = require('gulp-shell');
	var src = ProjectDir + '/html/**/*';

	return gulp.src(src)
		.pipe(shell([
			'echo <%= f(file.path) %>',
			'ls -l <%= file.path %>'
		], {
			templateData: {
				f: function (s) {
					return s;
				}
			}
		}));
});

gulp.task('r.js', function () {
	var shell = require('gulp-shell');
	var src = ProjectDir + '/html/**/*.html';

	return gulp.src(src)
		.pipe(shell([
				'echo Выполняется оптимизация согласно файлу конфигурации',
				'echo <%= f(file.path) %> :',
				'r.js -o <%= f(file.path) %>'
			]
			, {
				templateData: {
					f: function (s) {
						return s;
					}
				}
			}
		));
});

gulp.task('html2jade', function () {
	var html2jade = require('gulp-html2jade');

	var src = ProjectDir + '/html/**/*.html';
	var dst = ProjectDir + '/jade';

	gulp
		.src(src)
		.pipe(html2jade())
		.pipe(gulp.dest(dst));
});
