'use strict';

exports.isStar = true;
exports.runParallel = runParallel;

/** Функция паралелльно запускает указанное число промисов
 * @param {Array} jobs – функции, которые возвращают промисы
 * @param {Number} parallelNum - число одновременно исполняющихся промисов
 * @param {Number} timeout - таймаут работы промиса
 */

runParallel.prototype = {
    _translate(request, index, requestsData) {
        requestsData.requestIndex++;
        new Promise(resolve => {
            request()
                .then(resolve, resolve);
            setTimeout(() => resolve(new Error('Promise timeout')), requestsData.timeout);
        })
            .then(data => this._followingRequest(data, index, requestsData));
    },
    _followingRequest(data, index, requestsData) {
        requestsData.translationData[index] = data;
        requestsData.countCompeled++;
        if (requestsData.countCompeled === requestsData.jobs.length) {
            requestsData.resolve(requestsData.translationData);
        }
        if (requestsData.requestIndex < requestsData.jobs.length) {
            let nextIndex = requestsData.requestIndex;
            this._translate(requestsData.jobs[nextIndex], nextIndex, requestsData);
        }
    }
};

function runParallel(jobs, parallelNum, timeout = 1000) {
    // асинхронная магия
    return new Promise(resolve => {
        if (!jobs.length) {
            resolve([]);
        }

        let requestsData = {
            jobs,
            resolve,
            timeout,
            parallelNum,
            countCompeled: 0,
            requestIndex: 0,
            translationData: []
        };

        jobs
            .slice(0, parallelNum)
            .forEach((request, index) => {
                runParallel.prototype._translate(request, index, requestsData);
            });
    });
}
