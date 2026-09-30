/**
 * Vérifie/crée le bucket Supabase Storage et fait un test d'upload.
 * Usage : bun scripts/ensure-storage-bucket.ts
 * (Lit uniquement les variables d'environnement chargées par bun, jamais le fichier .env)
 */
import {
  getSupabaseAdmin,
  isSupabaseStorageConfigured,
  SUPABASE_BUCKET,
} from "../src/lib/supabase-storage";

async function main() {
  if (!isSupabaseStorageConfigured()) {
    console.error(
      "❌ SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY absents de l'environnement.",
    );
    process.exit(1);
  }

  const client = getSupabaseAdmin();
  if (!client) {
    console.error("❌ Client Supabase indisponible.");
    process.exit(1);
  }

  console.log("Bucket cible :", SUPABASE_BUCKET);

  const { data: buckets, error: listError } = await client.storage.listBuckets();
  if (listError) {
    console.error("❌ listBuckets :", listError.message);
    process.exit(1);
  }

  const existing = buckets?.find((b) => b.name === SUPABASE_BUCKET);
  if (!existing) {
    console.log("Bucket absent → création (public)...");
    const { error } = await client.storage.createBucket(SUPABASE_BUCKET, {
      public: true,
      fileSizeLimit: "5MB",
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    });
    if (error) {
      console.error("❌ createBucket :", error.message);
      process.exit(1);
    }
    console.log("✅ Bucket créé (public, 5 Mo max, images uniquement)");
  } else {
    console.log(`✅ Bucket existant (public: ${existing.public})`);
    if (!existing.public) {
      const { error } = await client.storage.updateBucket(SUPABASE_BUCKET, {
        public: true,
      });
      if (error) {
        console.error("❌ updateBucket :", error.message);
        process.exit(1);
      }
      console.log("✅ Bucket passé en public");
    }
  }

  // Test d'upload (PNG 1x1 en base64)
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );
  const testPath = `general/test-${Date.now()}.png`;
  const { error: upError } = await client.storage
    .from(SUPABASE_BUCKET)
    .upload(testPath, png, { contentType: "image/png" });

  if (upError) {
    console.error("❌ Test upload :", upError.message);
    process.exit(1);
  }

  const { data } = client.storage.from(SUPABASE_BUCKET).getPublicUrl(testPath);
  console.log("✅ Test upload OK :", data.publicUrl);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
