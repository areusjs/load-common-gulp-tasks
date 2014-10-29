# basic_failing

Most tasks should fail for this example, showing what tasks look like when they fail, e.g.

### `gulp ci`

should print

```bash
[11:20:33] Using gulpfile ~/Projects/load-common-gulp-tasks/examples/basic_failing/gulpfile.js
[11:20:33] Starting 'lint'...
[11:20:33] Starting 'felint'...
[11:20:33] Starting 'test-cover'...
[11:20:33] Starting 'nice-package'...

/Users/montgomeryc/Projects/load-common-gulp-tasks/examples/basic_failing/content/client-file.js
  line 1  col 30  Missing semicolon.

✖ 1 problem

1 errors

gulp 'lint,felint,test-cover,nice-package,ci' failed
```

### `gulp test-cover`

should print

```bash
[11:22:47] Using gulpfile ~/Projects/load-common-gulp-tasks/examples/basic_failing/gulpfile.js
[11:22:47] Starting 'test-cover'...
[11:22:47] Finished 'test-cover' after 28 ms


  ․

  1 passing (2ms)

----------------|-----------|-----------|-----------|-----------|
File            |   % Stmts |% Branches |   % Funcs |   % Lines |
----------------|-----------|-----------|-----------|-----------|
   lib/         |        50 |       100 |        50 |        50 |
      root.js   |         0 |       100 |         0 |         0 |
      square.js |       100 |       100 |       100 |       100 |
----------------|-----------|-----------|-----------|-----------|
All files       |        50 |       100 |        50 |        50 |
----------------|-----------|-----------|-----------|-----------|


=============================== Coverage summary ===============================
Statements   : 50% ( 2/4 )
Branches     : 100% ( 0/0 )
Functions    : 50% ( 1/2 )
Lines        : 50% ( 2/4 )
================================================================================
[11:22:47] ERROR: Coverage for statements (50%) does not meet threshold (80%)
ERROR: Coverage for lines (50%) does not meet threshold (80%)
ERROR: Coverage for functions (50%) does not meet threshold (80%)
[11:22:47] Wrote coverage reports to ./target/coverage
gulp 'test-cover' failed
```