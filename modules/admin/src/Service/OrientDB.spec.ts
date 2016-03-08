import {
    it,
    inject,
    injectAsync,
    describe,
    beforeEachProviders,
    TestComponentBuilder,
    setBaseTestProviders
} from 'angular2/testing';
import {
    TEST_BROWSER_PLATFORM_PROVIDERS,
    TEST_BROWSER_APPLICATION_PROVIDERS
} from 'angular2/platform/testing/browser';
setBaseTestProviders(TEST_BROWSER_PLATFORM_PROVIDERS,
    TEST_BROWSER_APPLICATION_PROVIDERS);

import {Component, provide} from 'angular2/core';

// Load the implementations that should be tested
import {ODatabase} from './OrientDB';

describe('ODatabase', () => {
    // provide our implementations or mocks to the dependency injector
    beforeEachProviders(() => [
        ODatabase
    ]);

    it('should have name property set', inject([ODatabase], (testService: ODatabase) => {
        testService = new ODatabase("http://orientdb.127.0.0.1.xip.io/smsc");
        testService.open("admin", "admin")
            .then(
                res => {
                    console.log(res);
                    expect(res).toBeDefined();
                }
            );
        //expect(testService.name).toBe('Injected Service');
    }));

});
