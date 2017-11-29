'use strict';

exports.isStar = true;
exports.runParallel = runParallel;

/** Функция паралелльно запускает указанное число промисов
 * @param {Array} jobs – функции, которые возвращают промисы
 * @param {Number} parallelNum - число одновременно исполняющихся промисов
 * @param {Number} timeout - таймаут работы промиса
 */


runParallel.prototype = {
    countCompleted: 0,
    requestIndex: 0,
    translationData: [],
    _translate: function (request, index) {
        this.requestIndex++;
        new Promise(resolve => {
            request().then(resolve, resolve);
            setTimeout(() => resolve(new Error('Promise timeout')), this.timeout);
        })
            .then(data => this._followingRequest(data, index));
    },
    _followingRequest: function (data, index) {
        this.translationData[index] = data;
        this.countCompleted++;
        if (this.jobs.length === this.countCompleted) {
            Promise.resolve(this.translationData);
        }
        if (this.requestIndex !== this.jobs.length) {
            this._translate(this.jobs[this.requestIndex], this.requestIndex);
        }
    }
};

function runParallel(jobs, parallelNum, timeout = 1000) {
    // асинхронная магия
    if (!jobs.length) {
        Promise.resolve([]);
    }

    runParallel.prototype.jobs = jobs;
    runParallel.prototype.parallelNum = parallelNum;
    runParallel.prototype.timeout = timeout;

    for (var index = 0; index < parallelNum; index++) {
        let request = jobs[index];
        runParallel.prototype._translate(request, index);
    }
}


