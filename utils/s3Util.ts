import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

// async function getSignedUrlForUpload(data: any): Promise<any> {
//   const version = process.env.S3_VERSION;
//   const region = process.env.S3_REGION;
//   const bucket = process.env.S3_BUCKET;
//   // const publicPath = process.env.S3_PUBLIC_PATH;

//   console.log({ version, region, bucket });
//   // console.log({ version, region, bucket, publicPath });

//   //TODO:move to ext config
//   const s3 = new AWS.S3({
//     useAccelerateEndpoint: false,
//     signatureVersion: version,
//     region: region,
//   });
//   console.log(s3,"===========s3===========")
//   const signedUrlExpireSeconds = 60 * 60;

//   const myBucket = bucket;

//   console.log(process.env.PROTOCOL_BASE_URL);
//   console.log("bucket------>", bucket);
//   console.log(data.path,"data------>", data);
//   console.log(data.filetype,"data.filetype------>");
//   //TODO: Use Axios to send http request
//   try {
//     const myKey =
//       data.path + "/" + uuidv4() + data?.filetype.replace(/^\.?/, ".");
//     const params = {
//       Bucket: myBucket,
//       Key: myKey,
//       Expires: signedUrlExpireSeconds,
//     };
//     return await new Promise((resolve, reject) =>
//       s3.getSignedUrl("putObject", params, function (err, url) {
//         if (err) {
//           console.log("Error getting presigned url from AWS S3", err);
//           reject({
//             success: false,
//             message: "Pre-Signed URL error",
//             urls: url,
//             error: err,
//           });
//         } else {
//           // const publicUrl =
//           //   "https://" +
//           //   bucket +
//           //   "." +
//           //   `s3.${region}.amazonaws.com` +
//           //   "/" +
//           //   myKey;
//           const publicUrl = "https://reference-buyer-app-assets.s3-ap-south-1.amazonaws.com/public-assets/"+myKey;
//           resolve({
//             success: true,
//             message: "AWS SDK S3 Pre-signed urls generated successfully.",
//             path: myKey,
//             urls: url,
//             publicUrl: publicUrl,
//           });
//         }
//       })
//     );
//   } catch (err) {
//     console.error("An error occurred while generating the signed URL", err);
//     return err;
//   }
// }

async function getSignedUrlForUpload(data:any): Promise<any> {

  const version = process.env.S3_VERSION;
  const region = process.env.S3_REGION;
  const bucket = process.env.S3_BUCKET || "reference-buyer-app-assets/public-assets";
  const publicPath = process.env.S3_PUBLIC_PATH;

  console.log({version,region,bucket,publicPath})

//TODO:move to ext config
  const s3 = new AWS.S3({
      useAccelerateEndpoint: false,
      signatureVersion: version,
      region: region
  });

  const signedUrlExpireSeconds = 60 * 60;

  let myBucket = bucket;

  console.log(process.env.PROTOCOL_BASE_URL)
 console.log("s3------>",s3)
 console.log("bucket------>",bucket)
 console.log("data------>",data)
 //TODO: Use Axios to send http request
 try {
     const myKey = data.path + '/' + uuidv4() + data.filetype.replace(/^\.?/, '.');
     const params = {
         Bucket: myBucket,
         Key: myKey,
         Expires: signedUrlExpireSeconds
     };
     return await new Promise(
         (resolve, reject) => s3.getSignedUrl('putObject', params, function (err, url) {
             if (err) {

                 console.log('Error getting presigned url from AWS S3', err);
                 reject({success: false, message: 'Pre-Signed URL error', urls: url});
             } else {
                 //const publicUrl = 'https://'+bucket+'.'+`s3.${region}.amazonaws.com`+'/'+myKey

                 const regionString = '-' + region;
                 myBucket = bucket.replace('/public-assets','');

                 let publicUrl = `https://${myBucket}.s3${regionString}.amazonaws.com/public-assets/${myKey}`;

                 //let publicUrl = `https://${myBucket}.s3${region}.amazonaws.com/public-assets/${myKey}`;

                 resolve({
                     success: true,
                     message: 'AWS SDK S3 Pre-signed urls generated successfully.',
                     path: myKey,
                     urls: url,
                     publicUrl:publicUrl
                 });
             }
         }));
 } catch (err) {
    console.error("An error occurred while generating the signed URL", err);
     return err;
 }
};

export default getSignedUrlForUpload;
