import { useState } from "react";

interface Props {
  src: string;
  alt: string;
}

const WorkImage = ({ src, alt }: Props) => {
  const [failed, setFailed] = useState(false);

  return (
    <div className="work-image-wrap">
      {failed ? (
        <div className="work-image-placeholder">[IMAGE UNAVAILABLE]</div>
      ) : (
        <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />
      )}
    </div>
  );
};

export default WorkImage;
