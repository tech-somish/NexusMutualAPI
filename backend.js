const fs = require('fs');
const _ = require('underscore');
const exec = require('child_process').execSync;

const dir_cosine = './Cosine/';
const dir_correlation = './Correlation/';

function orderByCTime(directory, files) {
  return new Promise((resolve, reject) => {
    var filesWithStats = [];
    _.each(files, function getFileStats(file) {
      var fileStats = fs.statSync(directory + file);
      filesWithStats.push({
        filename: file,
        ctime: fileStats.ctime
      });
      file = null;
    });
    if (filesWithStats.length != 0) {
      resolve(_.sortBy(filesWithStats, 'ctime').reverse());
    } else {
      reject('Error: No file exists');
    }
  });
}

async function runScript(address = '0x00', min_correlation = -1) {
  if (address === '0x00' && min_correlation === -1) {
    var errorCheck = false;
    try {
      exec('Rscript nxmcor.R');
    } catch (error) {
      errorCheck = true;
    }
    files_cosine = fs.readdirSync(dir_cosine);
    fname = await orderByCTime(dir_cosine, files_cosine);
  } else {
    try {
      exec('Rscript nxmcor.R -a ' + address + ' -m ' + min_correlation);
    } catch (error) {
      errorCheck = true;
    }

    files_correlation = fs.readdirSync(dir_correlation);
    fname = await orderByCTime(dir_correlation, files_correlation);
  }

  if (errorCheck === true) {
    return 9999;
  } else {
    return fname[0].filename;
  }
}

module.exports = {
  runScript
};
