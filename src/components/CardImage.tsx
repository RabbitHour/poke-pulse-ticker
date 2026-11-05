import { useState, type ImgHTMLAttributes } from "react";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" | "onError" | "srcSet"> & {
  src?: string | null;
  alt: string;
};

// Local paths and HTTPS images only. Identity matching belongs in the data layer.
function safeSource(value?: string | null): string {
  const source = value?.trim() ?? "";
  if (source.startsWith("/") && !source.startsWith("//")) return source;
  try {
    const url = new URL(source);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : "";
  } catch {
    return "";
  }
}

export function CardImage({ src, alt, style, ...props }: Props) {
  const source = safeSource(src);
  // Remount the stateful image when the source changes, including A -> B -> A.
  return <ImageAttempt key={source} source={source} alt={alt} style={style} {...props} />;
}

function ImageAttempt({ source, alt, style, ...props }: Omit<Props, "src"> & { source: string }) {
  const [failed, setFailed] = useState(false);
  if (!source || failed) {
    return (
      <span {...props} className={`card-image-placeholder ${props.className ?? ""}`} role="img" aria-label={`${alt}: image unavailable`}
        style={style}>
        Image unavailable
      </span>
    );
  }
  return <img {...props} src={source} alt={alt} style={style}
    loading={props.loading ?? "lazy"} decoding="async" onError={() => setFailed(true)} />;
}
