"use client";

import type {
  ContentBlock,
  PatchnoteSplitRatio,
} from "../../types/community";


function splitColumns(
  ratio:
    PatchnoteSplitRatio,

  imagePosition:
    | "left"
    | "right"
) {
  const [
    first,
    second,
  ] =
    ratio
      .split(
        "-"
      )
      .map(
        Number
      );


  const image =
    imagePosition ===
    "left"
      ? first
      : second;


  const text =
    100 -
    image;


  return `${image}fr ${text}fr`;
}


export default function PatchnoteContentRenderer({
  blocks,

  fallbackContent,

  compact =
    false,
}: {
  blocks:
    ContentBlock[];

  fallbackContent?:
    | string
    | null;

  compact?:
    boolean;
}) {
  if (
    !blocks.length
  ) {
    if (
      !fallbackContent
    ) {
      return null;
    }


    return (
      <div
        className={
          compact
            ? "patchContent compact"
            : "patchContent"
        }
      >
        <p className="patchContentText">
          {
            fallbackContent
          }
        </p>

        <RendererStyles />
      </div>
    );
  }


  return (
    <div
      className={
        compact
          ? "patchContent compact"
          : "patchContent"
      }
    >
      {blocks.map(
        (
          block,
          index
        ) => {
          const key =
            block.id ??
            `${block.type}-${index}`;


          if (
            block.type ===
            "heading"
          ) {
            if (
              !block.text
            ) {
              return null;
            }


            return (
              <h2
                key={
                  key
                }
                className="patchContentHeading"
              >
                {
                  block.text
                }
              </h2>
            );
          }


          if (
            block.type ===
            "text"
          ) {
            if (
              !block.text
            ) {
              return null;
            }


            return (
              <p
                key={
                  key
                }
                className="patchContentText"
              >
                {
                  block.text
                }
              </p>
            );
          }


          if (
            block.type ===
            "image"
          ) {
            if (
              !block.url
            ) {
              return null;
            }


            return (
              <figure
                key={
                  key
                }
                className="patchContentImage"
              >
                <img
                  src={
                    block.url
                  }
                  alt={
                    block.alt ||
                    ""
                  }
                />


                {block.caption ? (
                  <figcaption>
                    {
                      block.caption
                    }
                  </figcaption>
                ) : null}
              </figure>
            );
          }


          if (
            block.type ===
            "split"
          ) {
            const image = (
              <figure className="patchSplitImage">
                {block.imageUrl ? (
                  <img
                    src={
                      block.imageUrl
                    }
                    alt={
                      block.imageAlt ||
                      ""
                    }
                  />
                ) : (
                  <div className="patchSplitPlaceholder">
                    Image
                  </div>
                )}


                {block.imageCaption ? (
                  <figcaption>
                    {
                      block.imageCaption
                    }
                  </figcaption>
                ) : null}
              </figure>
            );


            const content = (
              <div className="patchSplitContent">
                {block.heading ? (
                  <h3>
                    {
                      block.heading
                    }
                  </h3>
                ) : null}


                {block.text ? (
                  <p>
                    {
                      block.text
                    }
                  </p>
                ) : null}
              </div>
            );


            return (
              <section
                key={
                  key
                }
                className={`patchSplit patchSplit-${block.imagePosition}`}
                style={{
                  gridTemplateColumns:
                    splitColumns(
                      block.ratio,

                      block.imagePosition
                    ),
                }}
              >
                {block.imagePosition ===
                "left" ? (
                  <>
                    {
                      image
                    }

                    {
                      content
                    }
                  </>
                ) : (
                  <>
                    {
                      content
                    }

                    {
                      image
                    }
                  </>
                )}
              </section>
            );
          }


          if (
            block.type ===
            "highlight"
          ) {
            return (
              <aside
                key={
                  key
                }
                className={`patchHighlight tone-${block.tone ?? "cyan"}`}
              >
                {block.eyebrow ? (
                  <span>
                    {
                      block.eyebrow
                    }
                  </span>
                ) : null}


                {block.heading ? (
                  <h3>
                    {
                      block.heading
                    }
                  </h3>
                ) : null}


                {block.text ? (
                  <p>
                    {
                      block.text
                    }
                  </p>
                ) : null}
              </aside>
            );
          }


          if (
            block.type ===
            "gallery"
          ) {
            const usable =
              block.images.filter(
                (
                  image
                ) =>
                  image.url
              );


            if (
              !usable.length
            ) {
              return null;
            }


            return (
              <section
                key={
                  key
                }
                className={`patchGallery columns-${block.columns ?? 2}`}
              >
                {usable.map(
                  (
                    image,
                    imageIndex
                  ) => (
                    <figure
                      key={
                        image.id ??
                        `${key}-${imageIndex}`
                      }
                    >
                      <img
                        src={
                          image.url
                        }
                        alt={
                          image.alt ||
                          ""
                        }
                      />


                      {image.caption ? (
                        <figcaption>
                          {
                            image.caption
                          }
                        </figcaption>
                      ) : null}
                    </figure>
                  )
                )}
              </section>
            );
          }


          if (
            block.type ===
            "divider"
          ) {
            return (
              <hr
                key={
                  key
                }
                className="patchDivider"
              />
            );
          }


          if (
            block.type ===
            "spacer"
          ) {
            return (
              <div
                key={
                  key
                }
                className={`patchSpacer patchSpacer-${block.size}`}
                aria-hidden="true"
              />
            );
          }


          return null;
        }
      )}


      <RendererStyles />
    </div>
  );
}


function RendererStyles() {
  return (
    <style jsx global>{`
      .patchContent {
        width:
          100%;
      }

      .patchContentHeading {
        margin:
          38px
          0
          13px;

        color:
          #f7fbff;

        font-size:
          clamp(
            26px,
            4vw,
            34px
          );

        line-height:
          1.12;

        letter-spacing:
          -0.035em;
      }

      .patchContentHeading:first-child {
        margin-top:
          0;
      }

      .patchContentText {
        margin:
          0
          0
          19px;

        color:
          #c5d2e8;

        font-size:
          17px;

        line-height:
          1.85;

        white-space:
          pre-wrap;
      }

      .patchContentImage {
        margin:
          30px
          0;
      }

      .patchContentImage img,
      .patchSplitImage img,
      .patchGallery img {
        display:
          block;

        width:
          100%;

        border:
          1px solid
          rgba(
            131,
            158,
            199,
            0.1
          );

        border-radius:
          18px;

        object-fit:
          cover;
      }

      .patchContentImage figcaption,
      .patchSplitImage figcaption,
      .patchGallery figcaption {
        margin-top:
          8px;

        color:
          #8294b2;

        font-size:
          12px;

        line-height:
          1.5;
      }


      /* =================================================
         SPLIT
         ================================================= */

      .patchSplit {
        display:
          grid;

        align-items:
          center;

        gap:
          clamp(
            22px,
            4vw,
            42px
          );

        margin:
          34px
          0;
      }

      .patchSplitImage {
        min-width:
          0;

        margin:
          0;
      }

      .patchSplitPlaceholder {
        min-height:
          240px;

        display:
          grid;

        place-items:
          center;

        border:
          1px dashed
          rgba(
            126,
            158,
            207,
            0.18
          );

        border-radius:
          18px;

        background:
          rgba(
            255,
            255,
            255,
            0.018
          );

        color:
          #5f7493;

        font-size:
          11px;

        font-weight:
          800;
      }

      .patchSplitContent h3 {
        margin:
          0
          0
          12px;

        color:
          white;

        font-size:
          clamp(
            24px,
            4vw,
            36px
          );

        line-height:
          1.1;

        letter-spacing:
          -0.035em;
      }

      .patchSplitContent p {
        margin:
          0;

        color:
          #b9c8df;

        font-size:
          16px;

        line-height:
          1.8;

        white-space:
          pre-wrap;
      }


      /* =================================================
         HIGHLIGHT
         ================================================= */

      .patchHighlight {
        margin:
          32px
          0;

        padding:
          clamp(
            22px,
            4vw,
            32px
          );

        border:
          1px solid
          rgba(
            99,
            221,
            255,
            0.2
          );

        border-radius:
          20px;

        background:
          radial-gradient(
            circle
            at
            90%
            10%,
            rgba(
              99,
              221,
              255,
              0.11
            ),
            transparent
            40%
          ),
          rgba(
            8,
            20,
            38,
            0.82
          );
      }

      .patchHighlight.tone-purple {
        border-color:
          rgba(
            185,
            133,
            255,
            0.24
          );

        background:
          radial-gradient(
            circle
            at
            90%
            10%,
            rgba(
              185,
              133,
              255,
              0.12
            ),
            transparent
            40%
          ),
          rgba(
            8,
            20,
            38,
            0.82
          );
      }

      .patchHighlight.tone-green {
        border-color:
          rgba(
            100,
            229,
            170,
            0.22
          );

        background:
          radial-gradient(
            circle
            at
            90%
            10%,
            rgba(
              100,
              229,
              170,
              0.1
            ),
            transparent
            40%
          ),
          rgba(
            8,
            20,
            38,
            0.82
          );
      }

      .patchHighlight.tone-amber {
        border-color:
          rgba(
            255,
            196,
            109,
            0.24
          );

        background:
          radial-gradient(
            circle
            at
            90%
            10%,
            rgba(
              255,
              196,
              109,
              0.1
            ),
            transparent
            40%
          ),
          rgba(
            8,
            20,
            38,
            0.82
          );
      }

      .patchHighlight > span {
        display:
          block;

        margin-bottom:
          8px;

        color:
          #63ddff;

        font-size:
          9px;

        font-weight:
          900;

        letter-spacing:
          0.13em;

        text-transform:
          uppercase;
      }

      .patchHighlight.tone-purple
        > span {
        color:
          #c4a0ff;
      }

      .patchHighlight.tone-green
        > span {
        color:
          #74e2ad;
      }

      .patchHighlight.tone-amber
        > span {
        color:
          #ffca78;
      }

      .patchHighlight h3 {
        margin:
          0;

        color:
          white;

        font-size:
          clamp(
            22px,
            4vw,
            31px
          );

        letter-spacing:
          -0.03em;
      }

      .patchHighlight p {
        margin:
          11px
          0
          0;

        color:
          #b8c8df;

        font-size:
          15px;

        line-height:
          1.75;

        white-space:
          pre-wrap;
      }


      /* =================================================
         GALLERY
         ================================================= */

      .patchGallery {
        display:
          grid;

        gap:
          14px;

        margin:
          30px
          0;
      }

      .patchGallery.columns-2 {
        grid-template-columns:
          repeat(
            2,
            minmax(
              0,
              1fr
            )
          );
      }

      .patchGallery.columns-3 {
        grid-template-columns:
          repeat(
            3,
            minmax(
              0,
              1fr
            )
          );
      }

      .patchGallery figure {
        min-width:
          0;

        margin:
          0;
      }

      .patchGallery img {
        aspect-ratio:
          16 /
          10;

        height:
          100%;

        max-height:
          390px;

        object-fit:
          cover;
      }


      /* =================================================
         DIVIDER / SPACER
         ================================================= */

      .patchDivider {
        height:
          1px;

        margin:
          34px
          0;

        border:
          0;

        background:
          linear-gradient(
            90deg,
            transparent,
            rgba(
              121,
              157,
              212,
              0.2
            ),
            transparent
          );
      }

      .patchSpacer-small {
        height:
          18px;
      }

      .patchSpacer-medium {
        height:
          38px;
      }

      .patchSpacer-large {
        height:
          70px;
      }


      /* =================================================
         COMPACT PREVIEW
         ================================================= */

      .patchContent.compact
        .patchContentHeading {
        margin:
          21px
          0
          8px;

        font-size:
          19px;
      }

      .patchContent.compact
        .patchContentText,
      .patchContent.compact
        .patchSplitContent
        p,
      .patchContent.compact
        .patchHighlight
        p {
        font-size:
          11px;

        line-height:
          1.65;
      }

      .patchContent.compact
        .patchSplit {
        gap:
          12px;

        margin:
          18px
          0;
      }

      .patchContent.compact
        .patchSplitContent
        h3,
      .patchContent.compact
        .patchHighlight
        h3 {
        font-size:
          16px;
      }

      .patchContent.compact
        .patchSplitImage
        img,
      .patchContent.compact
        .patchContentImage
        img,
      .patchContent.compact
        .patchGallery
        img {
        border-radius:
          10px;
      }

      .patchContent.compact
        .patchHighlight {
        margin:
          18px
          0;

        padding:
          15px;

        border-radius:
          12px;
      }

      .patchContent.compact
        .patchHighlight
        > span {
        font-size:
          6px;
      }

      .patchContent.compact
        .patchGallery {
        gap:
          7px;

        margin:
          18px
          0;
      }

      .patchContent.compact
        .patchGallery
        figcaption {
        font-size:
          7px;
      }

      .patchContent.compact
        .patchDivider {
        margin:
          20px
          0;
      }

      .patchContent.compact
        .patchSpacer-small {
        height:
          8px;
      }

      .patchContent.compact
        .patchSpacer-medium {
        height:
          16px;
      }

      .patchContent.compact
        .patchSpacer-large {
        height:
          28px;
      }


      /* =================================================
         MOBILE
         ================================================= */

      @media (
        max-width:
          760px
      ) {
        .patchSplit,
        .patchSplit.patchSplit-right {
          grid-template-columns:
            1fr !important;
        }

        .patchSplit.patchSplit-left
          .patchSplitImage,
        .patchSplit.patchSplit-right
          .patchSplitImage {
          order:
            1;
        }

        .patchSplit.patchSplit-left
          .patchSplitContent,
        .patchSplit.patchSplit-right
          .patchSplitContent {
          order:
            2;
        }

        .patchGallery.columns-3 {
          grid-template-columns:
            repeat(
              2,
              minmax(
                0,
                1fr
              )
            );
        }
      }


      @media (
        max-width:
          520px
      ) {
        .patchGallery.columns-2,
        .patchGallery.columns-3 {
          grid-template-columns:
            1fr;
        }
      }
    `}</style>
  );
}