import {
    it,
    inject,
    injectAsync,
    describe,
    beforeEachProviders,
    TestComponentBuilder
} from 'angular2/testing';

import {Component, provide} from 'angular2/core';

// Load the implementations that should be tested
import {ODatabase} from './OrientDB';

describe('ODatabase', () => {
    // provide our implementations or mocks to the dependency injector
    beforeEachProviders(() => [
        ODatabase
    ]);

    //it('getDatabasePath', inject([ ODatabase ], (odatabase) => {
    //    var address = "http://orientdb.127.0.0.1.xip.io/smsc";
    //
    //    expect("http://orientdb.127.0.0.1.xip.io/smsc").toEqual(address);
    //}));

});
