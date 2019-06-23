import { TextWithAttributedStyle } from "../layout/extract-text"
import { fontWithFallbacks } from "../layout/font-utils"
import { $ } from "./svg-util"
import { lineBaseline, lineFontSize, lineHeight } from "../layout/text-layout"
import { FontCache } from "../layout/"

const textStyles = (fontState: FontCache, style) => ({
  "font-family": fontWithFallbacks(fontState, style.fontFamily),
  "font-weight": style.fontWeight,
  "font-style": style.fontStyle,
  "font-size": style.fontSize,
})

const textAligns = {
  left: 0,
  center: 0.5,
  right: 1,
}

const textAnchors = {
  left: "start",
  center: "middle",
  right: "end",
}

export default (
  fontState: FontCache,
  { left, top, width, height },
  style: any,
  lines: TextWithAttributedStyle[]
): string => {
  if (!lines.length) return ""
  const { textAlign = "left" as string } = lines[0].attributedStyles[0].style
  const originX = width * textAligns[textAlign]

  const { textLines } = lines.reduce(
    (accum, line) => {
      const { text, attributedStyles } = line
      const originY =
        accum.y +
        lineBaseline(fontState, line) +
        (lineHeight(line) - lineFontSize(line)) / 2

      const tspans = attributedStyles.map(({ start, end, style }, i) =>
        $(
          "tspan",
          {
            x: i === 0 ? left + originX : undefined,
            y: i === 0 ? originY : undefined,
            fill: style.color,
            ...textStyles(fontState, style),
          },
          i === attributedStyles.length - 1
            ? text.slice(start, end).replace(/\s*$/, "")
            : text.slice(start, end)
        )
      )

      return {
        y: accum.y + lineHeight(line),
        textLines: accum.textLines.concat(tspans.join("\n")),
      }
    },
    {
      y: top,
      textLines: [],
    } as { y: number; textLines: string[] }
  )

  return $(
    "text",
    {
      // x: left + originX,
      // y: top,
      "text-anchor":
        textAlign !== "left" ? textAnchors[textAlign as string] : undefined,
    },
    textLines.join("\n")
  )
}
