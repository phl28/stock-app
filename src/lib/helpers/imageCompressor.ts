export const compressImage = (file: File | Blob, maxWidth: number = 1024, maxHeight: number = 1024) => {
    return new Promise<Blob>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          let width = img.width;
          let height = img.height;
  
          // Maintain the aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }
  
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
                if (blob) {
                  resolve(blob);
                } else {
                  reject(new Error('Failed to create blob from canvas'));
                }
              }, 'image/jpeg', 0.8);
            } else {
              reject(new Error('Failed to get canvas context'));
            }
          };
        };
        reader.onerror = (error) => {
          reject(error);
        };
    });
  };