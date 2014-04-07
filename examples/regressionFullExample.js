/**
  Simple example using EPSILON-SVR classificator to predict values
  Dataset : Housing, more info here http://archive.ics.uci.edu/ml/datasets/Housing
  
  Note : libsvm#findBestParameters function help to find gamma, C and epsilon parameters
  that provie the lowest Mean Square Error () 
**/
'use strict';

var libsvm = require('../lib/nodesvm'),
    _ = require('underscore'),
    humanizeDuration = require("humanize-duration");

var nFold= 3,
    fileName = './examples/datasets/housing.ds';

libsvm.readAndNormalizeDatasetAsync(fileName, function(housing){ 
  console.log('Data set normalized with following parameters :');
  console.log('  * mu = \n', housing.mu);
  console.log('  * sigma = \n', housing.sigma);   

  console.log('Look for parameters that provide the lower Mean Square Error : ');
  var args = {
    svmType : libsvm.SvmTypes.EPSILON_SVR,
    kernelType : libsvm.KernelTypes.RBF,
    cValues: [0.03125, 0.125, 0.5, 2, 8],
    gValues: [8, 2, 0.5, 0.125, 0.03125],
    epsilonValues: [8, 2, 0.5, 0.125, 0.03125],
    fold: nFold
  }; 
  libsvm.findBestParameters(housing.dataset, args, function(report) {
    // build SVM with found parameters
    console.log('Best params : \n', report);

    var svm = new libsvm.SVM({
      type: libsvm.SvmTypes.EPSILON_SVR,
      kernel: new libsvm.RadialBasisFunctionKernel(report.gamma),
      C: report.C,
      epsilon: report.epsilon
    });
    var training = _.sample(housing.dataset, housing.dataset.length);
    var tests = _.sample(housing.dataset, 20);
    // train the svm
    svm.trainAsync(training, function(){
      // predict some values
      for (var i = 0; i < 20;  i++){
        var test = tests[i];
        console.log('{expected: %d, predicted: %d}', test[1], svm.predict(test[0]));
      }
    });
  }, function(progressRate, remainingTime){
    // called during evaluation to report progress
    // remainingTime in ms
    if ((progressRate*100)%5 === 0){
      console.log('%d% achived. %s remaining...', progressRate * 100, humanizeDuration(remainingTime));
    }
  }); 
});