'use strict';
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
    beforeEach(() => {
        this.db = new ODatabase('http://orientdb.127.0.0.1.xip.io/smsc')
    });

    it('open OrientDB', () => {
        this.db.open('admin', 'admin')
            .then(
                res => {
                    expect(res).toBeDefined();
                }
            );
    });

    it('query to OrientDB', () => {
        this.db.query('select from OUser')
            .then(
                res => {
                    expect(res).toBeDefined();
                }
            );
    });

    it('create user', () => {
        this.db.create('test', '4862')
            .then(
                res => {
                    expect(res).toBeDefined();
                }
            );
    });

    it('loads a record from the record ID', () => {
        this.db.load('12:0')
            .then(
                res => {
                    expect(res).toBeDefined();
                }
            );
    });

    it('metadata', () => {
        this.db.metadata()
            .then(
                res => {
                    expect(res).toBeDefined();
                }
            );
    });

    it('save', () => {
        this.db.save()
            .then(
                res => {
                    expect(res).toBeDefined();
                }
            );
    });

    it('indexPut', () => {
        this.db.indexPut()
            .then(
                res => {
                    expect(res).toBeDefined();
                }
            );
    });
});


