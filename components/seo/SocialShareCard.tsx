import type {
  CSSProperties,
} from "react";

import {
  getSocialCardDescription,
  getSocialCardDomain,
  getSocialCardImage,
  type SocialCardData,
} from "../../lib/social-card";

type SocialShareCardProps = {
  data: SocialCardData;
};

export default function SocialShareCard({
  data,
}: SocialShareCardProps) {
  const backgroundImage =
    getSocialCardImage(
      data.image
    );

  const description =
    getSocialCardDescription(
      data.description
    );

  return (
    <div
      style={rootStyle}
    >
      <img
        src={
          backgroundImage
        }
        alt=""
        style={
          backgroundImageStyle
        }
      />

      <div
        style={
          backgroundOverlayStyle
        }
      />

      <div
        style={
          glowTopStyle
        }
      />

      <div
        style={
          glowBottomStyle
        }
      />

      <div
        style={
          gridStyle
        }
      />

      <div
        style={
          contentStyle
        }
      >
        <div
          style={
            headerStyle
          }
        >
          <div
            style={
              brandStyle
            }
          >
            <div
              style={
                brandIconStyle
              }
            >
              A
            </div>

            <div
              style={{
                display:
                  "flex",
                flexDirection:
                  "column",
              }}
            >
              <span
                style={
                  brandNameStyle
                }
              >
                AUROS
              </span>

              <span
                style={
                  brandSubStyle
                }
              >
                ROYALE
              </span>
            </div>
          </div>

          {data.badge ? (
            <div
              style={
                badgeStyle
              }
            >
              {
                data.badge
              }
            </div>
          ) : null}
        </div>

        <div
          style={
            mainStyle
          }
        >
          <div
            style={
              eyebrowStyle
            }
          >
            <span
              style={
                eyebrowLineStyle
              }
            />

            {
              data.eyebrow
            }
          </div>

          {data.version ? (
            <div
              style={
                versionStyle
              }
            >
              {
                data.version
              }
            </div>
          ) : null}

          <h1
            style={{
              ...titleStyle,

              fontSize:
                getTitleSize(
                  data.title
                ),
            }}
          >
            {
              data.title
            }
          </h1>

          {description ? (
            <p
              style={
                descriptionStyle
              }
            >
              {
                description
              }
            </p>
          ) : null}
        </div>

        <div
          style={
            footerStyle
          }
        >
          <div
            style={
              footerAccentStyle
            }
          >
            <span
              style={
                footerAccentDotStyle
              }
            />

            OFFICIAL AUROS EXPERIENCE
          </div>

          <span
            style={
              domainStyle
            }
          >
            {
              getSocialCardDomain()
            }
          </span>
        </div>
      </div>
    </div>
  );
}

function getTitleSize(
  title: string
) {
  if (
    title.length >
    68
  ) {
    return 46;
  }

  if (
    title.length >
    48
  ) {
    return 54;
  }

  if (
    title.length >
    30
  ) {
    return 62;
  }

  return 72;
}

const rootStyle:
  CSSProperties =
{
  position:
    "relative",

  width:
    "1200px",

  height:
    "630px",

  display:
    "flex",

  overflow:
    "hidden",

  background:
    "#030812",

  color:
    "#ffffff",

  fontFamily:
    "Arial, Helvetica, sans-serif",
};

const backgroundImageStyle:
  CSSProperties =
{
  position:
    "absolute",

  inset:
    0,

  width:
    "100%",

  height:
    "100%",

  objectFit:
    "cover",

  opacity:
    0.34,
};

const backgroundOverlayStyle:
  CSSProperties =
{
  position:
    "absolute",

  inset:
    0,

  background:
    "linear-gradient(90deg, rgba(2,7,16,0.98) 0%, rgba(3,9,20,0.94) 43%, rgba(5,13,27,0.75) 68%, rgba(5,13,27,0.55) 100%)",
};

const glowTopStyle:
  CSSProperties =
{
  position:
    "absolute",

  width:
    "580px",

  height:
    "580px",

  left:
    "-240px",

  top:
    "-310px",

  borderRadius:
    "999px",

  background:
    "rgba(71, 207, 255, 0.16)",

  filter:
    "blur(70px)",
};

const glowBottomStyle:
  CSSProperties =
{
  position:
    "absolute",

  width:
    "500px",

  height:
    "500px",

  right:
    "-200px",

  bottom:
    "-280px",

  borderRadius:
    "999px",

  background:
    "rgba(138, 85, 255, 0.15)",

  filter:
    "blur(80px)",
};

const gridStyle:
  CSSProperties =
{
  position:
    "absolute",

  inset:
    0,

  opacity:
    0.09,

  backgroundImage:
    "linear-gradient(rgba(112,220,255,0.32) 1px, transparent 1px), linear-gradient(90deg, rgba(112,220,255,0.32) 1px, transparent 1px)",

  backgroundSize:
    "56px 56px",
};

const contentStyle:
  CSSProperties =
{
  position:
    "relative",

  zIndex:
    5,

  width:
    "100%",

  height:
    "100%",

  display:
    "flex",

  flexDirection:
    "column",

  padding:
    "54px 66px 46px",

  boxSizing:
    "border-box",
};

const headerStyle:
  CSSProperties =
{
  width:
    "100%",

  display:
    "flex",

  justifyContent:
    "space-between",

  alignItems:
    "center",
};

const brandStyle:
  CSSProperties =
{
  display:
    "flex",

  alignItems:
    "center",

  gap:
    "14px",
};

const brandIconStyle:
  CSSProperties =
{
  width:
    "50px",

  height:
    "50px",

  display:
    "flex",

  alignItems:
    "center",

  justifyContent:
    "center",

  border:
    "1px solid rgba(110,225,255,0.38)",

  borderRadius:
    "13px",

  background:
    "rgba(69,202,255,0.1)",

  color:
    "#67ddff",

  fontSize:
    "24px",

  fontWeight:
    900,
};

const brandNameStyle:
  CSSProperties =
{
  color:
    "#ffffff",

  fontSize:
    "19px",

  fontWeight:
    900,

  letterSpacing:
    "0.12em",

  lineHeight:
    1,
};

const brandSubStyle:
  CSSProperties =
{
  marginTop:
    "4px",

  color:
    "#6fdcff",

  fontSize:
    "10px",

  fontWeight:
    800,

  letterSpacing:
    "0.32em",

  lineHeight:
    1,
};

const badgeStyle:
  CSSProperties =
{
  display:
    "flex",

  padding:
    "10px 16px",

  border:
    "1px solid rgba(117,219,255,0.24)",

  borderRadius:
    "999px",

  background:
    "rgba(20,84,116,0.16)",

  color:
    "#83e6ff",

  fontSize:
    "12px",

  fontWeight:
    800,

  letterSpacing:
    "0.12em",
};

const mainStyle:
  CSSProperties =
{
  flex:
    1,

  maxWidth:
    "880px",

  display:
    "flex",

  flexDirection:
    "column",

  justifyContent:
    "center",

  paddingBottom:
    "12px",
};

const eyebrowStyle:
  CSSProperties =
{
  display:
    "flex",

  alignItems:
    "center",

  gap:
    "13px",

  marginBottom:
    "15px",

  color:
    "#6de1ff",

  fontSize:
    "14px",

  fontWeight:
    900,

  letterSpacing:
    "0.16em",
};

const eyebrowLineStyle:
  CSSProperties =
{
  width:
    "38px",

  height:
    "3px",

  display:
    "flex",

  borderRadius:
    "99px",

  background:
    "#65ddff",
};

const versionStyle:
  CSSProperties =
{
  display:
    "flex",

  marginBottom:
    "7px",

  color:
    "#a98cff",

  fontSize:
    "31px",

  fontWeight:
    900,

  letterSpacing:
    "-0.02em",
};

const titleStyle:
  CSSProperties =
{
  maxWidth:
    "930px",

  margin:
    0,

  color:
    "#ffffff",

  fontWeight:
    900,

  letterSpacing:
    "-0.045em",

  lineHeight:
    0.98,
};

const descriptionStyle:
  CSSProperties =
{
  maxWidth:
    "790px",

  margin:
    "20px 0 0",

  color:
    "#a8b9cf",

  fontSize:
    "20px",

  fontWeight:
    500,

  lineHeight:
    1.45,
};

const footerStyle:
  CSSProperties =
{
  display:
    "flex",

  alignItems:
    "center",

  justifyContent:
    "space-between",

  borderTop:
    "1px solid rgba(118,157,198,0.15)",

  paddingTop:
    "22px",
};

const footerAccentStyle:
  CSSProperties =
{
  display:
    "flex",

  alignItems:
    "center",

  gap:
    "9px",

  color:
    "#71869f",

  fontSize:
    "11px",

  fontWeight:
    800,

  letterSpacing:
    "0.13em",
};

const footerAccentDotStyle:
  CSSProperties =
{
  width:
    "7px",

  height:
    "7px",

  display:
    "flex",

  borderRadius:
    "50%",

  background:
    "#55ddff",

  boxShadow:
    "0 0 16px rgba(85,221,255,0.9)",
};

const domainStyle:
  CSSProperties =
{
  color:
    "#96aac3",

  fontSize:
    "14px",

  fontWeight:
    700,
};