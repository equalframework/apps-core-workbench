#!/bin/bash
rm -rf .angular
# Windows : npm link is necessary to link sb-sahraed-lib from the global node_modules folder
npm link sb-shared-lib
# Windows : ng build --configuration production --output-hashing none --base-href="//workbench\\"
ng build --configuration production --output-hashing none --base-href="//workbench\\"
# Linux : ng build --configuration production --base-href="/workbench/"
touch manifest.json && rm -f web.app && cp manifest.json dist/symbiose/ && cd dist/symbiose && zip -r ../../web.app * && cd ../..
cat web.app | md5sum | awk '{print $1}' > version