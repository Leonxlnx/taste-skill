"use client";

import DiscloseImage from "@/registry/sources/animata/components/animata-disclose-image/disclose-image";

const previewImage = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 416 512"><rect width="416" height="512" fill="#f4efe6"/><circle cx="208" cy="205" r="112" fill="#fb7185"/><path d="M70 430 208 270l138 160" fill="#172554"/><circle cx="300" cy="92" r="28" fill="#facc15"/></svg>',
)}`;

export default function AnimataDiscloseImagePreview() {
  return (
    <div className="flex min-h-80 items-center justify-center rounded-2xl bg-sky-950 p-8">
      <div className="w-52">
        <DiscloseImage
          src={previewImage}
          alt="Abstract landscape with a coral sun and navy mountain"
          doorClassName="bg-sky-300"
        />
      </div>
    </div>
  );
}
