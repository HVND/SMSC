import {
    it,
    inject,
    injectAsync,
    describe,
    beforeEachProviders,
    TestComponentBuilder,
    setBaseTestProviders
} from 'angular2/testing';

import {Component, provide} from 'angular2/core';

// Load the implementations that should be tested
import {ODatabase} from './OrientDB';

describe('ODatabase', () => {
    // provide our implementations or mocks to the dependency injector
    beforeEachProviders(() => [
        ODatabase
    ]);

    it('should have name property set', inject([ODatabase], (testService: ODatabase) => {
        testService = new ODatabase('http://orientdb.127.0.0.1.xip.io/smsc');
        testService.open('admin', 'admin')
            .then(
                res => {
                    expect(typeof res).toBe('object');
                }
            );
    }));
});
