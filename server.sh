#!/bin/bash
rm -rf .angular
npm link sb-shared-lib
node --max_old_space_size=4096 "./node_modules/@angular/cli/bin/ng" serve --configuration developpement --host=equal.local --disable-host-check
