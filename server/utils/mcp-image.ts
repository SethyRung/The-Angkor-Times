const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};

function extensionFor(mediaType: string) {
  const base = mediaType.split(";")[0]?.trim().toLowerCase() ?? "";
  return extensions[base] ?? "img";
}

function decodeBase64(value: string) {
  const cleaned = value.replace(/\s/g, "");
  if (cleaned.length === 0 || cleaned.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(cleaned)) {
    throw createError({ statusCode: 400, message: "Image data must be base64" });
  }
  const bytes = Buffer.from(cleaned, "base64");
  if (bytes.length === 0) {
    throw createError({ statusCode: 400, message: "Image data is empty" });
  }
  return bytes;
}

export async function storeAgentImage(input: { mediaType: string; data: string }) {
  const bytes = decodeBase64(input.data);
  const mediaType = input.mediaType.split(";")[0]?.trim().toLowerCase() || input.mediaType;
  ensureBlob(new Blob([bytes], { type: mediaType }), { maxSize: "8MB", types: ["image"] });

  const stored = await blob.put(`cover.${extensionFor(mediaType)}`, bytes, {
    contentType: mediaType,
    addRandomSuffix: true,
    prefix: "news",
  });
  if (!stored.url) {
    throw createError({ statusCode: 500, message: "Failed to store image" });
  }
  return { url: stored.url };
}
