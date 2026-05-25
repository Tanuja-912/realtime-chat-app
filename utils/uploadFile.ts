export const uploadFile = async (file: File) => {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", "chat_app")

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/upload",
    {
      method: "POST",
      body: formData,
    }
  )

  const data = await res.json()

  if (!res.ok) {
    console.log("Cloudinary error:", data)
    throw new Error(data.error?.message || "Upload failed")
  }

  return {
    url: data.secure_url,
    public_id: data.public_id,
  }
}