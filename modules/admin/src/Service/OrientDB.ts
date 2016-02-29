import {Injectable} from 'angular2/core';
import {Observable} from 'rxjs/Rx';
import {Http, Headers, RequestOptions, Response} from 'angular2/http';
import 'rxjs/add/operator/map'

@Injectable()
export class ODatabase {
    private databaseUrl;
    private databaseName;
    private encodedDatabaseName;
    private databaseInfo;
    private commandResult;
    private commandResponse;
    private errorMessage;
    private evalResponse;
    private parseResponseLink;
    private removeObjectCircleReferences;
    private urlPrefix;
    private urlSuffix;
    private headers:Headers;

    constructor(private http:Http) {
    }

    getDatabasePath(databasePath:string) {
        //this.headers.append('Content-Type', 'application/png');
        this.databaseUrl = "";
        this.databaseName = "";
        this.encodedDatabaseName = "";
        this.databaseInfo = null;
        this.commandResult = null;
        this.commandResponse = null;
        this.errorMessage = null;
        this.evalResponse = true;
        this.parseResponseLink = true;
        this.removeObjectCircleReferences = true;
        this.urlPrefix = "/";
        this.urlSuffix = "";

        if (databasePath) {
            var pos = databasePath.indexOf('orientdb_proxy', 8); // JUMP HTTP
            if (pos > -1) {
                pos = databasePath.indexOf('/', pos); // END OF PROXY
            } else {
                pos = databasePath.indexOf('/', 8);
            }

            if (pos > -1) {
                this.databaseUrl = databasePath.substring(0, pos + 1);
                this.databaseName = databasePath.substring(pos + 1);
            } else {
                this.databaseUrl = databasePath;
                this.databaseName = null;
            }

            if (this.databaseName != null && this.databaseName.indexOf('/') > -1) {
                this.encodedDatabaseName = "";
                var parts = this.databaseName.split('/');
                for (var p in parts) {
                    if (!parts.hasOwnProperty(p)) {
                        continue;
                    }
                    if (this.encodedDatabaseName.length > 0)
                        this.encodedDatabaseName += '$';
                    this.encodedDatabaseName += parts[p];
                }
            } else
                this.encodedDatabaseName = this.databaseName;
        }
    }

    open(userName?:string, userPass?:string, authProxy?:string, type?:string) {
        if (userName == null) {
            userName = '';
        }
        if (userPass == null) {
            userPass = '';
        }
        if (authProxy != null && authProxy != '') {
            this.urlPrefix = this.databaseUrl + authProxy + "/";
        } else
            this.urlPrefix = this.databaseUrl;

        if (type == null || type == '') {
            type = 'GET';
        }

        this.headers = new Headers({
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': 'Basic ' + btoa(userName + ':' + userPass)
        });

        this.http.get(this.urlPrefix + 'database/' + this.encodedDatabaseName + this.urlSuffix,
             {headers: this.headers})
             .map(res => res.json())
             .subscribe(
                data => {
                    this.setErrorMessage(null);
                    if (data) {
                        this.setDatabaseInfo(this.transformResponse(data))
                        alert();
                    }
                },
                error => {
                    this.setErrorMessage('Connect error: ' + error.statusText);
                    this.setDatabaseInfo(null);
                }
        );

        return this.getDatabaseInfo();
    }

    transformResponse(msg) {
        if (this.getEvalResponse()) {
            var returnValue;
            if (msg.length > 0 && typeof msg != 'object') {
                returnValue = JSON.parse(msg)
            } else {
                returnValue = msg;
            }
            if (this.getParseResponseLinks()) {
                return this.parseConnections(returnValue);
            } else {
                return returnValue;
            }
        } else {
            return msg;
        }
    }

    parseConnections(obj) {
        if (typeof obj == 'object') {
            var linkMap = {
                "foo": 0
            };
            linkMap = this.createObjectsLinksMap(obj, linkMap);
            if (linkMap["foo"] == 1) {
                linkMap = this.putObjectInLinksMap(obj, linkMap);
                if (linkMap["foo"] == 2) {
                    obj = this.getObjectFromLinksMap(obj, linkMap);
                }
            }
        }
        return obj;
    }

    getObjectFromLinksMap = function (obj, linkMap) {
        for (var field in obj) {
            if (!obj.hasOwnProperty(field)) {
                continue;
            }
            var value = obj[field];
            if (typeof value == 'object') {
                this.getObjectFromLinksMap(value, linkMap);
            } else {
                if (field != '@rid' && value.length > 0
                    && value.charAt(0) == '#' && linkMap[value] != null) {
                    obj[field] = linkMap[value];
                }
            }
        }
        return obj;
    }

    putObjectInLinksMap = function (obj, linkMap) {
        for (var field in obj) {
            if (!obj.hasOwnProperty(field)) {
                continue;
            }
            var value = obj[field];
            if (typeof value == 'object') {
                this.putObjectInLinksMap(value, linkMap);
            } else {
                if (field == '@rid' && value.length > 0
                    && linkMap.hasOwnProperty(value)
                    && linkMap[value] === null) {
                    linkMap["foo"] = 2;
                    linkMap[value] = obj;
                }
            }
        }
        return linkMap;
    }

    createObjectsLinksMap(obj, linkMap) {
        for (var field in obj) {
            if (!obj.hasOwnProperty(field)) {
                continue;
            }
            var value = obj[field];
            if (typeof value == 'object') {
                this.createObjectsLinksMap(value, linkMap);
            } else {
                if (typeof value == 'string') {
                    if (value.length > 0 && value.charAt(0) == '#') {
                        if (!linkMap.hasOwnProperty(value)) {
                            linkMap["foo"] = 1;
                            linkMap[value] = null;
                        }
                    }
                }
            }
        }
        return linkMap;
    }

    removeCircleReferences(obj, linkMap) {
        linkMap = this.removeCircleReferencesPopulateMap(obj, linkMap);
        if (obj != null && typeof obj == 'object' && !Array.isArray(obj)) {
            if (obj['@rid'] != null && obj['@rid']) {
                var rid = this.getRidWithPound(obj['@rid']);
                linkMap[rid] = rid;
            }
        }
        this.removeCircleReferencesChangeObject(obj, linkMap);
    }

    getRidWithPound = function (rid) {
        if (rid.indexOf('#', 0) > -1) {
            return rid;
        } else {
            return '#' + rid;
        }
    }

    removeCircleReferencesPopulateMap = function (obj, linkMap) {
        for (var field in obj) {
            if (!obj.hasOwnProperty(field)) {
                continue;
            }
            var value = obj[field];
            if (value != null && typeof value == 'object' && !Array.isArray(value)) {
                if (value['@rid'] != null && value['@rid']) {
                    var rid = this.getRidWithPound(value['@rid']);
                    if (linkMap[rid] == null || !linkMap[rid]) {
                        linkMap[rid] = value;
                    }
                    linkMap = this.removeCircleReferencesPopulateMap(value,
                        linkMap);
                }
            } else if (value != null && typeof value == 'object'
                && Array.isArray(value)) {
                for (var i in value) {
                    if (!value.hasOwnProperty(i)) {
                        continue;
                    }
                    var arrayValue = value[i];
                    if (arrayValue != null && typeof arrayValue == 'object') {
                        if (arrayValue['@rid'] != null && arrayValue['@rid']) {
                            var rid = this.getRidWithPound(arrayValue['@rid']);
                            if (linkMap[rid] == null || !linkMap[rid]) {
                                linkMap[rid] = arrayValue;
                            }
                        }
                        linkMap = this.removeCircleReferencesPopulateMap(
                            arrayValue, linkMap);
                    }
                }
            }
        }
        return linkMap;
    }

    removeCircleReferencesChangeObject(obj,
                                       linkMap) {
        for (var field in obj) {
            if (!obj.hasOwnProperty(field)) {
                continue;
            }
            var value = obj[field];
            if (value != null && typeof value == 'object' && !Array.isArray(value)) {
                var inspectObject = true;
                if (value['@rid'] != null && value['@rid']) {
                    var rid = this.getRidWithPound(value['@rid']);
                    if (linkMap[rid] != null && linkMap[rid]) {
                        var mapValue = linkMap[rid];
                        if (typeof mapValue == 'object') {
                            linkMap[rid] = rid;
                        } else {
                            obj[field] = mapValue;
                            inspectObject = false;
                        }
                    }
                }
                if (inspectObject) {
                    this.removeCircleReferencesChangeObject(value, linkMap);
                }
            } else if (value != null && typeof value == 'object'
                && Array.isArray(value)) {
                for (var i in value) {
                    if (!value.hasOwnProperty(i)) {
                        continue;
                    }
                    var arrayValue = value[i];
                    if (typeof arrayValue == 'object') {
                        var inspectObject = true;
                        if (arrayValue['@rid'] != null && arrayValue['@rid']) {
                            var rid = this.getRidWithPound(arrayValue['@rid']);
                            if (linkMap[rid] != null && linkMap[rid]) {
                                var mapValue = linkMap[rid];
                                if (typeof mapValue == 'object') {
                                    linkMap[rid] = rid;
                                } else {
                                    value[i] = mapValue;
                                    inspectObject = false;
                                }
                            }
                        }
                        if (inspectObject) {
                            this.removeCircleReferencesChangeObject(arrayValue,
                                linkMap);
                        }
                    }
                }
            }
        }
    }


    private handleError(error:Response) {
        // in a real world app, we may send the server to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    }

    //postJSON() {
    //    var json = JSON.stringify({var1: "test", var2: 3});
    //    var params = 'json=' + json;
    //    var headers = new Headers();
    //    headers.append('Content-Type',
    //        'application/x-www-form-urlencoded');
    //
    //    return this.http.post('http://validate.jsontest.com',
    //    params,{
    //            headers: headers
    //        })
    //        .map(res => res.json())
    //}

    getCurrentTime() {
        //return this.http.get('https://raw.githubusercontent.com/HVND/AngularJS/master//modules/admin/package.json')
        //return this.http.get('http://localhost:2480/listDatabases')
        //return this.http.get('http://localhost:2480/database/utf-8')
        //    .map(res => res.json());
    }

    getUserName():string {
        if (!this.databaseInfo)
            return null;

        return this.databaseInfo.currentUser;
    }

    getDatabaseInfo():string {
        return this.databaseInfo;
    }

    setDatabaseInfo(iDatabaseInfo) {
        this.databaseInfo = iDatabaseInfo;
    }

    getUrlSuffix():string {
        return this.urlSuffix;
    }

    setUrlSuffix(iUrlSuffix) {
        this.urlSuffix = iUrlSuffix;
    }

    getCommandResult():string {
        return this.commandResult;
    }

    setCommandResult(iCommandResult) {
        this.commandResult = iCommandResult;
    }

    getCommandResponse():string {
        return this.commandResponse;
    }

    setCommandResponse(iCommandResponse) {
        this.commandResponse = iCommandResponse;
    }

    getErrorMessage():string {
        return this.errorMessage;
    }

    setErrorMessage(iErrorMessage) {
        this.errorMessage = iErrorMessage;
    }

    getDatabaseUrl():string {
        return this.databaseUrl;
    }

    setDatabaseUrl(iDatabaseUrl) {
        this.databaseUrl = iDatabaseUrl;
    }

    getDatabaseName():string {
        return this.encodedDatabaseName;
    }

    setDatabaseName(iDatabaseName) {
        this.encodedDatabaseName = iDatabaseName;
    }

    getEvalResponse():string {
        return this.evalResponse;
    }

    setEvalResponse(iEvalResponse) {
        this.evalResponse = iEvalResponse;
    }

    getParseResponseLinks():string {
        return this.parseResponseLink;
    }

    setParseResponseLinks(iParseResponseLinks) {
        this.parseResponseLink = iParseResponseLinks;
    }
}