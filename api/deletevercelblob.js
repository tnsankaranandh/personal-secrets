import { list, del, BlobServiceRateLimited } from '@vercel/blob';
import { setTimeout } from 'node:timers/promises';

async function deleteAllBlobs() {
  let cursor = undefined;
  let totalDeleted = 0;
  const BATCH_SIZE = 100; // Adjust as needed to respect rate limits
  const DELAY_MS = 1000; // Delay between batches

  do {
    const listResult = await list({ cursor, limit: BATCH_SIZE, token: "vercel_blob_rw_BrscGHBIP0NAOjZK_8BDxnLdevcztzy9n8RuLPuFOR3N1tk" });

    if (listResult.blobs.length > 0) {
      const batchUrls = listResult.blobs.map((blob) => blob.url);
      
      let retries = 0;
      const maxRetries = 3;

      while (retries <= maxRetries) {
        try {
          await del(batchUrls, {
            token: "vercel_blob_rw_BrscGHBIP0NAOjZK_8BDxnLdevcztzy9n8RuLPuFOR3N1tk"
          });
          totalDeleted += listResult.blobs.length;
          console.log(`Deleted ${listResult.blobs.length} blobs. Total deleted: ${totalDeleted}`);
          break; // Exit retry loop on success
        } catch (error) {
          if (error instanceof BlobServiceRateLimited && retries < maxRetries) {
            console.warn(`Rate limit hit. Retrying in ${DELAY_MS * (2 ** retries)}ms...`);
            await setTimeout(DELAY_MS * (2 ** retries)); // Exponential backoff
            retries++;
          } else {
            console.error('Error deleting blobs:', error);
            throw error; // Re-throw if not rate limit or max retries reached
          }
        }
      }
    }
    cursor = listResult.cursor;
    if (cursor) {
      await setTimeout(DELAY_MS); // Wait before fetching next batch
    }
  } while (cursor);

  console.log(`Finished deleting all blobs. Total deleted: ${totalDeleted}`);
}

deleteAllBlobs().catch(console.error);