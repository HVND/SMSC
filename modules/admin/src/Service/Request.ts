"use strict";
export interface RequestGetOptions {
    url: string;
}
export interface RequestGetResponse {
    string;
}
export class Request {
    private userName;
    private userPass;

    setDate(userName, userPass) {
        this.userName = userName;
        this.userPass = userPass;
    }

    get(options: RequestGetOptions): Promise<RequestGetResponse> {
        return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open("get", options.url);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('Authorization', 'Basic ' + btoa(this.userName + ':' + this.userPass));
            xhr.onload = function () {
                if (xhr.status === 200) {
                    resolve(xhr.responseText)
                } else {
                    reject(new Error(xhr.statusText));
                }
            };
            xhr.send();
        });
    }
}