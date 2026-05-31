import React, { useState } from 'react';
import { PixelFileUpload } from './PixelFileUpload';

export function Default() {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <PixelFileUpload
      label="Upload files"
      hint="PNG or JPG, up to 5 MB each"
      value={files}
      onChange={setFiles}
      accept="image/*"
      multiple
      maxSize={5 * 1024 * 1024}
      maxFiles={5}
    />
  );
}

export function ButtonMode() {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <PixelFileUpload
      label="Choose a file"
      value={files}
      onChange={setFiles}
      dropzone={false}
    />
  );
}

export function WithError() {
  return (
    <PixelFileUpload
      label="Attachments"
      error="At least one file is required"
      accept=".pdf,.doc,.docx"
    />
  );
}
