export async function uploadToImgBB(file) {
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
  
  if (!apiKey || apiKey === 'your_imgbb_api_key') {
    throw new Error("Please add your ImgBB API key to the .env file");
  }

  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  
  if (!data.success) {
    throw new Error("Failed to upload image to ImgBB");
  }
  
  // Returns the direct image URL (e.g. https://i.ibb.co/xyz/image.jpg)
  return data.data.url; 
}