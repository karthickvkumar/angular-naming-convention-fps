// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  // production: false,
  // wavelengthApiUrl: 'https://api-stg.fpsinc.com/wavelengthcd/api/v1.1',
  // scUrl: 'https://sc-dev-sc.fpsinc.com/sc/rest'
  production: false,
  wavelengthApiUrl: 'https://api-dev.fpsinc.com/wavelengthcd/api/v1.1',
  scUrl: 'https://sc-dev-sc.fpsinc.com/sc/rest'
};

/*
 * In development mode, for easier debugging, you can ignore zone related error
 * stack frames such as `zone.run`/`zoneDelegate.invokeTask` by importing the
 * below file. Don't forget to comment it out in production mode
 * because it will have a performance impact when errors are thrown
 * https://api-uat.fpsinc.com/wavelengthcd/api/v1.1/testcalls
 * https://wavelength-api.fpsinc.com/api/v1.1/testcalls
 * https://api2-stg.fpsinc.com/wavelengthcd/api/v1.1
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
