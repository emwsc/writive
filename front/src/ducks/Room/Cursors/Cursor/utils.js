
import calculateSize from "calculate-size";

export function getTextWidth(text) {
  const size = calculateSize(text, {
    font: '"Montserrat", sans-serif',
    fontSize: "14px"
  });
  return size.width;
}
