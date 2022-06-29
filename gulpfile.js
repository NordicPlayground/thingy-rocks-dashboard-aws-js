const { src, dest, series } = require("gulp");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify-es").default;
const sass = require("gulp-sass")(require("sass"));
const concat = require("gulp-concat");
const cleanCSS = require("gulp-clean-css");

function build(cb) {
  src(["assets/favicon.png", "assets/index.html"]).pipe(dest("dist/"));

  src(["assets/js/classes/*.js", "assets/js/*.js"])
    .pipe(uglify())
    .pipe(
      rename(function (path) {
        path.basename += "-min";
      })
    )
    .pipe(dest("dist/js/"));

  src(["assets/js/Cesium-1.75/Build/Cesium/**"]).pipe(dest("dist/js/Cesium"));

  src("assets/img/**").pipe(dest("dist/img/"));

  src("assets/fonts/**").pipe(dest("dist/fonts"));

  src("assets/scss/*.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(concat("styles-min.css"))
    .pipe(cleanCSS())
    .pipe(dest("dist/"));

  cb();
}

exports.default = series(build);
