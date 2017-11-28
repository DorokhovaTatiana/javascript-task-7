'use strict';

exports.isStar = true;
exports.runParallel = runParallel;

/** Функция паралелльно запускает указанное число промисов
 * @param {Array} jobs – функции, которые возвращают промисы
 * @param {Number} parallelNum - число одновременно исполняющихся промисов
 * @param {Number} timeout - таймаут работы промиса
 */

let countRunning = 0;
let countCompleted = 0;
let requestIndex = 0;
let translationData = [];

function runParallel(jobs, parallelNum, timeout = 1000) {
    // асинхронная магия
    return new Promise(resolve => {
        if (!jobs.length) {
            resolve([]);
        }

        jobs
            .slice(0, parallelNum)
            .forEach((request, index) => {
                translate(request, index);
            });

        function translate(request, index) {
            countRunning++;
            requestIndex++;
            requestApply(request, timeout)
                .then(data => followingRequest(data, index));
        }

        function followingRequest(data, index) {
            countRunning--;
            countCompleted++;
            translationData[index] = data;
            if (requestIndex === jobs.length && countCompleted === requestIndex) {
                resolve(translationData);
            }
            if (countRunning < parallelNum && requestIndex !== jobs.length) {
                translate(jobs[requestIndex], requestIndex);
            }
        }
    });
}

function requestApply(request, timeout) {
    return new Promise((resolve, reject) => {
        request()
            .then(resolve, reject);
        setTimeout(() => reject(new Error('Долго выполняется')), timeout);
    });
}
