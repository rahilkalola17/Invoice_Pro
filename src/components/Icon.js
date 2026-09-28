import React from "react";
import Svg, {
  Path,
  Circle,
  Rect,
  Line,
  Polyline,
  Polygon,
  Ellipse,
} from "react-native-svg";
import { useTheme } from "../theme";
import ICONS from "./iconData";

const TAGS = {
  path: Path,
  circle: Circle,
  rect: Rect,
  line: Line,
  polyline: Polyline,
  polygon: Polygon,
  ellipse: Ellipse,
};

// Lucide icons (the set shadcn/ui uses), e.g. <Icon name="plus" size={18} />
export default function Icon({ name, size = 20, color, strokeWidth = 2 }) {
  const { colors } = useTheme();
  const nodes = ICONS[name];
  if (!nodes) return null;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color || colors.foreground}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {nodes.map(([tag, attrs], i) => {
        const Shape = TAGS[tag];
        return <Shape key={i} {...attrs} />;
      })}
    </Svg>
  );
}
