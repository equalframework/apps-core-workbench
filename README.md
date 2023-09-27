# equal Workbench

* Table of content
    * [Install the application in your equal instance](#install-the-application-in-your-equal-instance)
        * [Getting the files](#getting-the-files)
        * [Setting up the instance of equal](#setting-up-the-instance-of-equal)
        * [Initialize the app](#initialize-the-app)
        * [use workbench](#use-workbench)
        * [run or compile the project](#run-or-compile-the-project)
    * [Installing dependencies](#installing-dependencies)
        * [nodeJS](#nodejs)
        * [nodeJS dependencies](#nodejs-dependencies)
        * [sb-shared-lib](#sb-shared-lib)
        * [Run the project](#run-the-project)
        * [Build the project](#build-the-project)
    * [Explications for dev of the tool](#explications-for-dev-of-the-tool)


## Install the application in your equal instance

You obviously need an instance of [**equal**](https://equal.run) correctly set up with the latest core package from `dev2.0` branch.

I'll use `http://equal.local` as the location of my equal instance. be sure to replace it by yours.

### Getting the files

You can get the files needed by [compiling the project](#run-or-compile-the-project) or by downloading it from the [latest release](https://github.com/f7ed0/equal-workbench/releases)

### Setting up the instance of equal

place both `web.app` and `manifest.json` file in `packages/core/app/workbench` (create it if it doesn't exists, replace the files if they already exists)

In the file `packages\core\manifest.json` add `workbench` to the `apps` field
```json
// here is an example of `packages\core\manifest.json`
{
    "name": "core",
    "description": "Foundations package holding the application logic of the elementary entities.",
    "version": "2.0",
    "author": "Cedric Francoys",
    "license": "LGPL-3",
    "depends_on": [],
    "apps": [ "apps", "auth", "app", "settings", "workbench" ],
    "tags": ["equal", "core"]
}
```

### Initialize the app

To initialize the app you need to (re)initialize the core package
```
./equal.run --do=core_init_package --package=core
```
or
```
http://equal.local?do=core_init_package&package=core
```
you should have a working workbench now !

### use workbench

you can now find workbench here

```
http://equal.local/workbench
```

## run or compile the project

### Installing dependencies

You obviously need an instance of [**equal**](https://equal.run) correctly set up.

#### nodeJS

First of all you will need a recent version of **node.js** (LTS version is preferred)

* For linux of macOS users I recommend checking [this article](https://nodejs.org/en/download/package-manager).
* For windows user, you can download the [installer](https://nodejs.org/en/download).

#### nodeJS dependencies

when **node.js** is ready, just type theses commands :
```bash
npm install -g @angular/cli
npm install -g @angular/cdk
npm install -g @reactivex/rxjs
``` 

#### sb-shared-lib

Once **node.js** and its dependencies installed you can use the script `dependency-installer.sh` to install **sb-shared-lib**.

### Run the project

you can run it with angular using the `serve.sh` script

### Build the project

to build the project you can use the `build.sh` script.

## Explications for dev of the tool

good luck lol.