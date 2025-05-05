import { 
  S3Client, 
  HeadBucketCommand, 
  CreateBucketCommand, 
  PutBucketPolicyCommand 
} from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test'
  },
  endpoint: 'http://localhost:4566',
  forcePathStyle: true,
  region: 'us-east-1'
});

const bucketName = 'my-local-bucket';

async function initializeS3() {
  try {
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
      console.log(`Bucket ${bucketName} already exists`);
    } catch (error) {
      await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
      console.log(`Bucket ${bucketName} created successfully`);
    }

    const publicReadPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${bucketName}/*`
        }
      ]
    };

    await s3Client.send(new PutBucketPolicyCommand({
      Bucket: bucketName,
      Policy: JSON.stringify(publicReadPolicy)
    }));

    console.log('S3 initialization completed successfully');
  } catch (error) {
    console.error('Error initializing S3:', error);
    process.exit(1);
  }
}

initializeS3();