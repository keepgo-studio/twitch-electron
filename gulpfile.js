const gulp = require("gulp");
const shell = require("gulp-shell");
const webpack = require("webpack-stream");
const named = require("vinyl-named");
const browserSync = require("browser-sync").create();
const { exec } = require("child_process");

const esConfig = require("./src/app/webpack.config.js");

// const ts = require("gulp-typescript");
// const nodeProject = ts.createProject("./src/tsconfig.json");

const builds = {
  es: () =>
    gulp
      .src(["src/app/index.ts", "src/app/worker/worker.ts"])
      .pipe(named())
      .pipe(webpack(esConfig))
      .on("error", console.error)
      .pipe(gulp.dest("dist/app/")),

  public: () => gulp.src("src/public/**").pipe(gulp.dest("dist/public")),

  node: () => gulp.src(["src/*.ts"]).pipe(shell("tsc -p ./src/tsconfig.json")),

  // gulp
  // .src(["src/*.ts"])
  // .pipe(nodeProject())
  // .pipe(gulp.dest("dist/"))
};

gulp.task("build", gulp.parallel([builds.public, builds.es, builds.node]));

gulp.task("hot-reload", (done) => {
  browserSync.init({
    server: {},
    files: "dist",
    localOnly: true,
    open: false,
  });

  done();
});

gulp.task("watch", () => {
  gulp.watch(["src/**/*.scss", "src/app/**/*.ts"]).on("change", builds.es);

  gulp
    .watch(["src/app.preload.ts"])
    .on("change" , () => exec("tsc -p ./src/tsconfig.json"));

  gulp.watch(["src/public/**"]).on("change", builds.public);
});
