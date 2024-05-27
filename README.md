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

here is an example of `packages\core\manifest.json`
```json
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

## Explications for dev of this tool

### Routing system

This angular app use `RouterMemory` service for navigation. This is a custom service that allow two things :
 * variable storage for each different routes when using `navigate(command:any[],args:{[val:string]:any}|undefined)` method. these variable can be retrieved when a component calls `retrieveArgs():any`
 * Going back to the previous route by calling `goBack()`, the service keep an historic of the route taken since last refresh of the page. if you call it without navigating before, it naviagates to `/` by default

These are the existing routes to this day :

* in `app-routing.module.ts` :
  * `/` : `PackageModule` 
  * in `package-routing.module.ts`
    * `views_edit/:view_name` : `VieweditorModule`
    * `views/:type/:entity` : `ViewModule`
    * `fields/:selected_package/:selected_class` : `FieldModule`
    * `routes` : `AppInRoutesModule`
    * `controllers/:selected_package` : `AppInControllerModule`
    * `models/:selected_package` : `AppInModelModule`

### API Calls

This app use a custom lib called `sb-shared-lib`.

To make request to equal backend we use `ApiService` class from this library.

Each module that need to make api calls should have his own standalone service that uses `ApiService` to create more precise method. You can find them in the `_services` folder in each module directory.

### Custom data structures

There are two custom structure made to handle equal json representation of equal object

#### FieldClass (Model)

FieldClass is used to handle Model field during edition. it hold the original json representation and the edited representation of a field and implements method to make it easier to handle in the code.

#### ViewElement (View)

ViewElement and its inherited class are used to handle view edition.
it allows a tree-like approach of the view structure.

You can add, edit or remove properties from a type of element independently of the others.

for the parsing, testing and exporting, each element calls its child method making a tree traversal of the structure.

it also make sure to pass unhandled part of the structure without altering it (see `leftover` attribute).

### Testing with Karma and Jasmine

To test your version of eQual Workbench you can use the built-in tool of angular. with this command :

```bash
ng test
```

Please make sure you have provided a chrome/chromium executable path in the environment variable CHROME_BIN. Karma need it to test angular components.

#### Known issue when testing and how to fix them

##### no provider for httpClient !

You need to import SharedLibModule in your testing dynamic module to fix this issue. Do not import http client or it will be resulting in another bug

##### Injector has already been destroyed.

The easy fix for this one is to tell Jasmine to not destroy the Injector after each tests using this call inside of the anonymous function of the describe block : 

```js
beforeAll(() => {
// Deactivate teardown for these tests because of a problem with
// the primeNg dialog.
TestBed.resetTestEnvironment();
TestBed.initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting(),
    {teardown: {destroyAfterEach: false}}
    );
});
```

##### this.currentLoader.getTranslation is not a function

This is due to providing HttpClient or importing HttpClientModule into your test file. it can also happen when you are using TranslationLoader instead of TranslationFakeLoader.


## Worflows

This part is inspire by several graph workflow projects such as :
* https://github.com/d3/d3
* https://github.com/tgdwyer/WebCola
* https://github.com/google/workflow-graph
* https://github.com/swimlane/ngx-graph
* https://github.com/ultrasonicsoft/ng-application-builder
