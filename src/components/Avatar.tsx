import { User, UserRound, CircleUserRound } from "lucide-react";

interface AvatarProps {
  image?: string | null;
  gender?: string;
  size?: number;
}

export function Avatar({ image, gender, size = 40 }: AvatarProps) {
  // If there is a valid image, return it
  if (image && image.trim() !== "") {
    return (
      <img
        src={image}
        alt="User"
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  // Gender-based fallback icons
  const iconProps = { width: size, height: size };

  if (gender?.toLowerCase() === "male") return <User {...iconProps} />;
  if (gender?.toLowerCase() === "female") return <UserRound {...iconProps} />;

  return <CircleUserRound {...iconProps} />;
}
