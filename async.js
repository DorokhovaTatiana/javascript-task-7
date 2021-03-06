'use strict';

exports.isStar = true;
exports.runParallel = runParallel;

/** Функция паралелльно запускает указанное число промисов
 * @param {Array} jobs – функции, которые возвращают промисы
 * @param {Number} parallelNum - число одновременно исполняющихся промисов
 * @param {Number} timeout - таймаут работы промиса
 */

class Translator {
    constructor(jobs, parallelNum, timeout, resolve) {
        this.jobs = jobs;
        this.requestIndex = 0;
        this.timeout = timeout;
        this.resolve = resolve;
        this.countCompelled = 0;
        this.translationData = [];
        this.parallelNum = parallelNum;
    }
    _translate(request, index) {
        this.requestIndex++;
        new Promise(resolve => {
            request()
                .then(resolve, resolve);
            setTimeout(() => resolve(new Error('Promise timeout')), this.timeout);
        })
            .then(data => this._followingRequest(data, index));
    }
    _followingRequest(data, index) {
        this.translationData[index] = data;
        this.countCompelled++;
        if (this.countCompelled === this.jobs.length) {
            this.resolve(this.translationData);
        }
        if (this.requestIndex < this.jobs.length) {
            let nextIndex = this.requestIndex;
            this._translate(this.jobs[nextIndex], nextIndex);
        }
    }
}

function runParallel(jobs, parallelNum, timeout = 1000) {
    // асинхронная магия
    return new Promise(resolve => {
        if (!jobs.length) {
            resolve([]);
        }
        let translator = new Translator(jobs, parallelNum, timeout, resolve);
        jobs
            .slice(0, parallelNum)
            .forEach((request, index) => {
                translator._translate(request, index);
            });
    });
}
