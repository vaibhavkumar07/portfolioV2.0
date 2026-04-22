import { MdArrowOutward } from "react-icons/md";
import { socials } from "../data";
import "./styles/SocialIcons.css";

const SocialIcons = () => {
  return (
    <div className="social-icons">
      <a href={socials.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
        <span>in</span>
        <MdArrowOutward />
      </a>
      <a href={socials.github} target="_blank" rel="noreferrer" aria-label="GitHub">
        <span>gh</span>
        <MdArrowOutward />
      </a>
      <a href={`mailto:${socials.email}`} aria-label="Email">
        <span>@</span>
      </a>
    </div>
  );
};

export default SocialIcons;
