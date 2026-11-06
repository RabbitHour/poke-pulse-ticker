import { useState, type ImgHTMLAttributes } from "react";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" | "onError" | "srcSet"> & {
  src?: string | null;
  alt: string;
  highResolution?: boolean;
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

export function CardImage({ src, alt, style, highResolution, ...props }: Props) {
  const source = safeSource(src);
  const enhanced = highResolution && /^https:\/\/assets\.tcgdex\.net\/[^?]+\/low\.(?:webp|png|jpg)$/.test(source)
    ? source.replace(/\/low\.(?:webp|png|jpg)$/, "/high.webp") : source;
  // Remount the stateful image when the source changes, including A -> B -> A.
  return <ImageAttempt key={enhanced} source={source} enhanced={enhanced} alt={alt} style={style} {...props} />;
}

function ImageAttempt({ source, enhanced, alt, style, ...props }: Omit<Props, "src"> & { source: string; enhanced: string }) {
  const [activeSource, setActiveSource] = useState(enhanced);
  const failed = !activeSource;
  if (!source || failed) {
    return (
      <span {...props} className={`card-image-placeholder ${props.className ?? ""}`} role="img" aria-label={`${alt}: image unavailable`}
        style={style}>
        Image unavailable
      </span>
    );
  }
  return <img {...props} src={activeSource} alt={alt} style={style}
    loading={props.loading ?? "lazy"} decoding="async" onError={() => setActiveSource(activeSource !== source ? source : "")} />;
}
