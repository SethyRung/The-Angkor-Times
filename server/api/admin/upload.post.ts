export default defineEventHandler(async (event) => {
  return blob.handleUpload(event, {
    formKey: "files",
    multiple: false,
    ensure: {
      maxSize: "5MB",
      types: ["image"],
    },
    put: {
      addRandomSuffix: true,
      prefix: "news",
    },
  });
});
