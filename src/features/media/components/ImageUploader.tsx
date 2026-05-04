type Props = {
  label?: string;
  onFileSelected: (file: File) => Promise<void>;
};

export default function ImageUploader({ label = "Tải ảnh", onFileSelected }: Props) {
  const inputId = `image-uploader-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div>
      <label htmlFor={inputId} className="mb-1 block text-xs text-slate-600">
        {label}
      </label>
      <input
        id={inputId}
        type="file"
        accept="image/*"
        className="w-full text-sm"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void onFileSelected(file);
        }}
      />
    </div>
  );
}
