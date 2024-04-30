import { useState } from "react";

export function useInpaint(
  {
    onSuccess,
    stabilityApiKey,
  }: {
    onSuccess?: (image: string) => void;
    stabilityApiKey: string;
  } = { stabilityApiKey: "" },
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<string | null>(null);
  const [mask, setMask] = useState<string | null>(null);

  const inpaint = async (
    imageUrl: string,
    canvas: HTMLCanvasElement,
    prompt: string,
  ) => {
    setLoading(true);
    const formData = new FormData();
    const clonedCanvas = document.createElement("canvas");
    clonedCanvas.width = canvas.width;
    clonedCanvas.height = canvas.height;

    const clonedCanvasContext = clonedCanvas.getContext("2d");
    if (!clonedCanvasContext) return;

    // Draw the original canvas onto the cloned canvas
    clonedCanvasContext.drawImage(canvas, 0, 0);

    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();
    formData.append("image", imageBlob);

    if (!clonedCanvasContext) throw new Error("Failed to get canvas context");
    const imageData = clonedCanvasContext.getImageData(
      0,
      0,
      canvas.width,
      canvas.height,
    );
    for (let i = 0; i < imageData.data.length; i += 4) {
      // Check if the alpha channel is transparent
      if (imageData.data[i + 3] !== 0) {
        imageData.data[i] = 255; // Set red channel to maximum
        imageData.data[i + 1] = 255; // Set green channel to maximum
        imageData.data[i + 2] = 255; // Set blue channel to maximum
        imageData.data[i + 3] = 255; // Set alpha channel to fully opaque
      } else {
        imageData.data[i] = 0; // Set red channel to maximum
        imageData.data[i + 1] = 0; // Set green channel to maximum
        imageData.data[i + 2] = 0; // Set blue channel to maximum
        imageData.data[i + 3] = 255;
      }
    }
    clonedCanvasContext.putImageData(imageData, 0, 0);
    clonedCanvas.toBlob(async (blob) => {
      if (!blob) return;
      setMask(URL.createObjectURL(blob));
      formData.append("mask", blob, "mask.png");
      formData.append("prompt", prompt);
      formData.append("output_format", "webp");

      const result = await fetch(
        `https://api.stability.ai/v2beta/stable-image/edit/inpaint`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${stabilityApiKey}`, // Ensure this is your correct API Key
            Accept: "image/*",
          },
          body: formData,
        },
      )
        .then((response) => {
          if (response.ok) {
            return response.blob(); // Assuming you want the image back as a blob
          }
          throw new Error("Network response was not ok.");
        })
        .then((blob) => {
          // Do something with the blob here, e.g., display the edited image
          // Create a local URL for the blob to be used as an image src, for example
          const imageUrl = URL.createObjectURL(blob);
          setData(imageUrl);
          onSuccess && onSuccess(imageUrl);
        })
        .catch((error) => {
          setLoading(false);
          setError(error);
        });

      setLoading(false);
      return result;
    });
  };

  return { inpaint, data, mask, loading, error };
}
