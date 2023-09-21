# ZerakiAnalytics

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.2.13.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.
Run `ng build --configuration=staging` for staging build. App will run with  `environment.staging.ts`

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

SERVE ANGULAR APP OVER HTTPS (LOCALHOST – ANGULAR CLI)
January 3, 2020  |  1 Comment
Sometimes, we need to run an Angular App over HTTPS in localhost for testing a PWA, interacting with Identity Provider as Identity Server 4, so on.
Angular CLI can help us to do this requirement but first, we need to create our localhost certificate.

Step 1 – Creating a certificate
You can create your own certificate but Why you do reinvent the wheel? I recommend you using this great repository:
https://github.com/RubenVermeulen/generate-trusted-ssl-certificate

git clone https://github.com/RubenVermeulen/generate-trusted-ssl-certificate.git

cd generate-trusted-ssl-certificate

bash generate.sh
You should now have a server.crt and a server.key file in the repository folder.

Step 2 – Installing the certificate in Windows
Double click in the certificate (server.crt)
Click in “Install certificate“
Store it at the Machine level
Next & Select “Place all certificates in the following store“
Browse ==> Select “Trusted Root Certification Authorities“
Ok, next & finish.
Perfect, the certificate has already been installed 😀

Step 3 – Configuring Angular CLI to run the app over HTTPS
We use the ng serve command with the following option to serve an https app:

–ssl= true ==> Serve using HTTPS | Default: false
–sslCert= sslCertPath ==> SSL Certificate to use for serving HTTPS | sslCertPath: it is the certificate location.
–sslKey= sslKeyPath ==> SSL Key to use for serving HTTPS | sslKeyPath: it is the private key location.
We create an SSL Folder at SRC Folder level and then, we copy the private key (server.key) and the certificate (server.crt) in.


After that, we are already prepared to run our app over HTTPS, we use the following command:

ng serve --ssl true -o --sslKey ssl/server.key --sslCert ssl/server.crt

Https works 😉
Our site runs over https in localhost but we need to write a lot of options when we want to serve the app:


To avoid to write the option ssl | sslCert | sslKey each time that we want to run this app over https, we can configure the angular.json file.
We need to add:

"serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          "configurations": {
            "production": {
              "browserTarget": "zeraki-analytics:build:production"
            },
            // 1
            "development": {
              "browserTarget": "zeraki-analytics:build:development",
              "ssl": true
              "sslKey": "generate-trusted-ssl-certificate/server.key",
              "sslCert": "generate-trusted-ssl-certificate/server.crt"
            }
            //  2
            "development": {
              "browserTarget": "zeraki-analytics:build:development",
              "ssl": true,
              "sslKey": "../../../localhost.key",
              "sslCert": "../../../localhost.crt"
              }
          },


Finally, we can use one of these commands to run the app over https:

ng serve

----------------------------

JavaScript heap hack

 on package.json file

 "start": "node --max_old_space_size=4192 ./node_modules/@angular/cli/bin/ng serve",
  "build": "node --max_old_space_size=4192 ./node_modules/@angular/cli/bin/ng build",
    
# Zeraki-backend
