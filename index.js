/**
 * This lamda function takes images from one S3 bucket, then
 * using jimp, compress and resize the image, and finally
 * write it to a second S3 bucket.
 */
const Jimp = require("jimp");
const AWS = require('aws-sdk');
const fs = require('fs');
const s3 = new AWS.S3();

const LOCATION = '/tmp/';

/**
 * Event handler that starts all the processing. This is
 * the equivalent to main function
 */
exports.handler = async (event) => {
    const tasks = event.tasks;
    const promises = event.tasks.map( task => compress(task) );
    const results = await Promise.all(promises);
    const responseBody = buildResponseBody(event.invocationId,results);
    return responseBody;
};

async function compress(task){
    const { Body } = await s3.getObject({
	Bucket	: process.env.SOURCE_BUCKET,
	Key	: task.s3Key 
    }).promise();
    fs.writeFileSync(LOCATION + task.s3Key, Body);
    const img = await Jimp.read(LOCATION + task.s3Key);
    if(img.bitmap.width > 1720)
	img.resize(1720,Jimp.AUTO);
    const newImg = await img.quality(30).writeAsync(LOCATION + task.s3Key+'.jpg');
    const compressedImage = fs.readFileSync(LOCATION + task.s3Key + '.jpg');
    const data = await s3.upload({
	Bucket  : process.env.DEST_BUCKET,
        Key     : task.s3Key,
	Body    : compressedImage
    }).promise();
    fs.unlinkSync(LOCATION + task.s3Key);
    fs.unlinkSync(LOCATION + task.s3Key+'.jpg');
    return {
      taskId: task.taskId,
      resultCode: "Succeeded",
      resultString: "\"" + Body.length/1000 + "Kb->" 
	    + compressedImage.length/1000 + "Kb\""
    }
}

function buildResponseBody(invocationId, results){
    return {
      invocationSchemaVersion: "1.0",
      treatMissingKeysAs : "PermanentFailure",
      invocationId : invocationId,
      results: results
    }
}

