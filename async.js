'use strict';

exports.isStar = true;
exports.runParallel = runParallel;

/** Функция паралелльно запускает указанное число промисов
 * @param {Array} jobs – функции, которые возвращают промисы
 * @param {Number} parallelNum - число одновременно исполняющихся промисов
 * @param {Number} timeout - таймаут работы промиса
 */

runParallel.prototype = {
    countCompeled: 0,
    requestIndex: 0,
    translationData: [],
    _translate: function (request, index) {
        this.requestIndex++;
        new Promise(resolve => {
            request()
                .then(resolve, resolve);
            setTimeout(() => resolve(new Error('Promise timeout')), this.timeout);
        })
            .then(data => this._followingRequest(data, index));
    },
    _followingRequest: function (data, index) {
        this.translationData[index] = data;
        this.countCompeled++;
        if (this.countCompeled === this.jobs.length) {
            this.resolve(this.translationData);
        }
        if (this.requestIndex < this.jobs.length) {
            this._translate(this.jobs[this.requestIndex], this.requestIndex);
        }
    }
};

function runParallel(jobs, parallelNum, timeout = 1000) {
    // асинхронная магия
    return new Promise(resolve => {
        if (!jobs.length) {
            resolve([]);
        }
        runParallel.prototype.resolve = resolve;
        runParallel.prototype.jobs = jobs;
        runParallel.prototype.parallelNum = parallelNum;
        runParallel.prototype.timeout = timeout;
        jobs
            .slice(0, parallelNum)
            .forEach((request, index) => {
                runParallel.prototype._translate(request, index);
            });
    });
}
