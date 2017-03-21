var async = require('async');
var aws = require('aws-sdk');
var request = require('request');

var s3 = new aws.S3();

exports.handler = function (event, context, callback) {
  async.waterfall([
    function download(next) {
      var bucket = event.Records[0].s3.bucket.name;
      var key = event.Records[0].s3.object.key;
      console.log('Downloading ' + key + ' from ' + bucket);
      s3.getObject({
        Bucket: bucket,
        Key: key
      }, next);
    },
    function upload(response, next) {
      var url = process.env.POST_URL;
      console.log('POSTing to ' + url);
      request.post(url, {
        method: 'POST',
        auth: {
          user: process.env.API_USER,
          pass: process.env.API_PASS
        },
        headers: {
          'Content-Type': 'application/octet-stream'
        },
        gzip: true,
        body: response.Body
      }, next);
    }
  ], callback);
};