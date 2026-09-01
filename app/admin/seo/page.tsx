"use client";

import {
  useMemo,
  useState,
} from "react";

import AdminPageGuard from "../../../components/admin/AdminPageGuard";


const SITE_URL =
  "https://auros-uefn.com";


export default function AdminSeoPage() {
  return (
    <AdminPageGuard>
      <SeoPreviewTool />
    </AdminPageGuard>
  );
}


function SeoPreviewTool() {
  const [
    title,
    setTitle,
  ] =
    useState(
      "Auros Royale — Official Website"
    );


  const [
    description,
    setDescription,
  ] =
    useState(
      "Explore Auros Royale, discover the interactive map, read the latest news and patchnotes, browse the gallery and follow the development of the Auros experience."
    );


  const [
    path,
    setPath,
  ] =
    useState(
      "/"
    );


  const [
    image,
    setImage,
  ] =
    useState(
      "/auros_royale_pfp_draft_1.png"
    );


  const cleanPath =
    useMemo(
      () => {
        const trimmed =
          path.trim();


        if (
          !trimmed ||
          trimmed ===
          "/"
        ) {
          return "/";
        }


        return trimmed.startsWith(
          "/"
        )
          ? trimmed
          : `/${trimmed}`;
      },
      [
        path,
      ]
    );


  const fullUrl =
    `${SITE_URL}${
      cleanPath ===
      "/"
        ? ""
        : cleanPath
    }`;


  const imageUrl =
    image.startsWith(
      "http"
    )
      ? image
      : `${SITE_URL}${
          image.startsWith(
            "/"
          )
            ? image
            : `/${image}`
        }`;


  return (
    <>
      <div className="seoAdminPage">
        <header className="seoHeader">
          <div>
            <span>
              SEO 2.0
            </span>


            <h1>
              Search Preview
            </h1>


            <p>
              Preview titles, descriptions, URLs and social cards
              before publishing content.
            </p>
          </div>


          <div className="seoStatus">
            SEO SYSTEM
            <strong>
              2.0
            </strong>
          </div>
        </header>


        <div className="seoLayout">
          <section className="seoCard seoEditor">
            <div className="seoCardHeader">
              <span>
                METADATA
              </span>

              <strong>
                Preview Input
              </strong>
            </div>


            <SeoField
              label="Page Title"
              hint={`${title.length} characters`}
            >
              <input
                value={
                  title
                }
                onChange={(
                  event
                ) =>
                  setTitle(
                    event.target.value
                  )
                }
              />
            </SeoField>


            <SeoField
              label="Description"
              hint={`${description.length} characters`}
            >
              <textarea
                rows={
                  6
                }
                value={
                  description
                }
                onChange={(
                  event
                ) =>
                  setDescription(
                    event.target.value
                  )
                }
              />
            </SeoField>


            <SeoField
              label="URL Path"
              hint="Canonical URL"
            >
              <div className="seoUrlInput">
                <span>
                  auros-uefn.com
                </span>

                <input
                  value={
                    path
                  }
                  onChange={(
                    event
                  ) =>
                    setPath(
                      event.target.value
                    )
                  }
                />
              </div>
            </SeoField>


            <SeoField
              label="Social Image"
              hint="Absolute URL or public path"
            >
              <input
                value={
                  image
                }
                onChange={(
                  event
                ) =>
                  setImage(
                    event.target.value
                  )
                }
              />
            </SeoField>


            <div className="seoRecommendations">
              <strong>
                SEO Checks
              </strong>


              <SeoCheck
                good={
                  title.length >=
                    30 &&
                  title.length <=
                    60
                }
                text={
                  title.length <
                  30
                    ? "Title is quite short."
                    : title.length >
                      60
                    ? "Title may be truncated in Google."
                    : "Title length looks good."
                }
              />


              <SeoCheck
                good={
                  description.length >=
                    120 &&
                  description.length <=
                    160
                }
                text={
                  description.length <
                  120
                    ? "Description could be more descriptive."
                    : description.length >
                      160
                    ? "Description may be truncated in search."
                    : "Description length looks good."
                }
              />


              <SeoCheck
                good={
                  cleanPath.startsWith(
                    "/"
                  )
                }
                text="Canonical URL is valid."
              />


              <SeoCheck
                good={
                  !!image.trim()
                }
                text={
                  image.trim()
                    ? "Social image configured."
                    : "Social image is missing."
                }
              />
            </div>
          </section>


          <main className="seoPreviews">
            <section className="seoCard">
              <div className="seoCardHeader">
                <span>
                  GOOGLE
                </span>

                <strong>
                  Search Result Preview
                </strong>
              </div>


              <div className="googlePreview">
                <div className="googleSiteRow">
                  <div className="googleIcon">
                    A
                  </div>


                  <div>
                    <strong>
                      Auros Royale
                    </strong>

                    <span>
                      {
                        fullUrl
                      }
                    </span>
                  </div>
                </div>


                <h2>
                  {title ||
                    "Page Title"}
                </h2>


                <p>
                  {description ||
                    "Page description will appear here."}
                </p>
              </div>
            </section>


            <section className="seoCard">
              <div className="seoCardHeader">
                <span>
                  SOCIAL SHARE
                </span>

                <strong>
                  Discord / X / Messaging
                </strong>
              </div>


              <div className="socialPreview">
                {image ? (
                  <img
                    src={
                      imageUrl
                    }
                    alt=""
                  />
                ) : (
                  <div className="socialPlaceholder">
                    SOCIAL IMAGE
                  </div>
                )}


                <div className="socialContent">
                  <span>
                    AUROS-UEFN.COM
                  </span>


                  <h3>
                    {title ||
                      "Page Title"}
                  </h3>


                  <p>
                    {description ||
                      "Page description"}
                  </p>
                </div>
              </div>
            </section>


            <section className="seoCard">
              <div className="seoCardHeader">
                <span>
                  GENERATED
                </span>

                <strong>
                  Metadata Summary
                </strong>
              </div>


              <div className="metadataSummary">
                <MetadataLine
                  label="Title"
                  value={
                    title ||
                    "—"
                  }
                />


                <MetadataLine
                  label="Canonical"
                  value={
                    fullUrl
                  }
                />


                <MetadataLine
                  label="OG Image"
                  value={
                    imageUrl ||
                    "—"
                  }
                />


                <MetadataLine
                  label="Robots"
                  value="index, follow"
                />
              </div>
            </section>
          </main>
        </div>
      </div>


      <style jsx global>{`
        .seoAdminPage {
          width:
            100%;

          padding:
            18px
            0
            70px;

          color:
            white;
        }


        .seoHeader {
          display:
            flex;

          align-items:
            flex-end;

          justify-content:
            space-between;

          gap:
            22px;

          margin-bottom:
            18px;
        }


        .seoHeader
          > div:first-child
          > span {
          color:
            #63ddff;

          font-size:
            9px;

          font-weight:
            950;

          letter-spacing:
            0.14em;
        }


        .seoHeader h1 {
          margin:
            7px
            0
            0;

          font-size:
            clamp(
              35px,
              5vw,
              50px
            );

          line-height:
            1;

          letter-spacing:
            -0.045em;
        }


        .seoHeader p {
          max-width:
            650px;

          margin:
            10px
            0
            0;

          color:
            #869ab8;

          font-size:
            11px;

          line-height:
            1.6;
        }


        .seoStatus {
          display:
            flex;

          align-items:
            center;

          gap:
            8px;

          padding:
            9px
            11px;

          border:
            1px
            solid
            rgba(
              99,
              221,
              255,
              0.15
            );

          border-radius:
            10px;

          background:
            rgba(
              99,
              221,
              255,
              0.03
            );

          color:
            #7187a5;

          font-size:
            7px;

          font-weight:
            900;
        }


        .seoStatus strong {
          color:
            #63ddff;
        }


        .seoLayout {
          display:
            grid;

          grid-template-columns:
            minmax(
              300px,
              0.75fr
            )
            minmax(
              0,
              1.25fr
            );

          gap:
            16px;

          align-items:
            start;
        }


        .seoCard {
          overflow:
            hidden;

          border:
            1px
            solid
            rgba(
              125,
              153,
              196,
              0.12
            );

          border-radius:
            17px;

          background:
            rgba(
              8,
              17,
              33,
              0.92
            );
        }


        .seoEditor {
          display:
            grid;

          gap:
            14px;

          padding:
            17px;
        }


        .seoCardHeader {
          padding:
            15px
            17px;

          border-bottom:
            1px
            solid
            rgba(
              125,
              153,
              196,
              0.07
            );
        }


        .seoEditor
          .seoCardHeader {
          margin:
            -17px
            -17px
            3px;
        }


        .seoCardHeader span {
          display:
            block;

          color:
            #63ddff;

          font-size:
            7px;

          font-weight:
            950;

          letter-spacing:
            0.12em;
        }


        .seoCardHeader strong {
          display:
            block;

          margin-top:
            4px;

          font-size:
            12px;
        }


        .seoField {
          display:
            grid;

          gap:
            7px;
        }


        .seoFieldTitle {
          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            10px;
        }


        .seoFieldTitle strong {
          color:
            #a5b6cd;

          font-size:
            8px;
        }


        .seoFieldTitle span {
          color:
            #607592;

          font-size:
            7px;
        }


        .seoField input,
        .seoField textarea {
          width:
            100%;

          padding:
            10px
            11px;

          border:
            1px
            solid
            rgba(
              125,
              153,
              196,
              0.13
            );

          border-radius:
            9px;

          outline:
            0;

          background:
            rgba(
              255,
              255,
              255,
              0.023
            );

          color:
            white;

          font:
            inherit;

          font-size:
            10px;
        }


        .seoField textarea {
          resize:
            vertical;
        }


        .seoField input:focus,
        .seoField textarea:focus {
          border-color:
            rgba(
              99,
              221,
              255,
              0.3
            );
        }


        .seoUrlInput {
          display:
            flex;

          align-items:
            center;

          overflow:
            hidden;

          border:
            1px
            solid
            rgba(
              125,
              153,
              196,
              0.13
            );

          border-radius:
            9px;

          background:
            rgba(
              255,
              255,
              255,
              0.023
            );
        }


        .seoUrlInput > span {
          padding-left:
            10px;

          color:
            #5d7290;

          font-size:
            8px;
        }


        .seoUrlInput input {
          border:
            0;

          background:
            transparent;
        }


        .seoRecommendations {
          display:
            grid;

          gap:
            7px;

          margin-top:
            4px;

          padding:
            12px;

          border:
            1px
            solid
            rgba(
              125,
              153,
              196,
              0.08
            );

          border-radius:
            11px;

          background:
            rgba(
              255,
              255,
              255,
              0.012
            );
        }


        .seoRecommendations
          > strong {
          margin-bottom:
            2px;

          font-size:
            9px;
        }


        .seoCheck {
          display:
            flex;

          align-items:
            center;

          gap:
            8px;

          color:
            #8297b4;

          font-size:
            8px;
        }


        .seoCheck > span {
          width:
            7px;

          height:
            7px;

          flex:
            0
            0
            auto;

          border-radius:
            50%;

          background:
            #e2a95e;
        }


        .seoCheck.good
          > span {
          background:
            #67dca4;
        }


        .seoPreviews {
          min-width:
            0;

          display:
            grid;

          gap:
            16px;
        }


        .googlePreview {
          padding:
            22px;
        }


        .googleSiteRow {
          display:
            flex;

          align-items:
            center;

          gap:
            9px;
        }


        .googleIcon {
          width:
            30px;

          height:
            30px;

          display:
            grid;

          place-items:
            center;

          border-radius:
            50%;

          background:
            rgba(
              99,
              221,
              255,
              0.09
            );

          color:
            #63ddff;

          font-size:
            10px;

          font-weight:
            950;
        }


        .googleSiteRow strong {
          display:
            block;

          color:
            #dfe6f1;

          font-size:
            10px;
        }


        .googleSiteRow span {
          display:
            block;

          margin-top:
            2px;

          color:
            #8291a6;

          font-size:
            8px;
        }


        .googlePreview h2 {
          margin:
            12px
            0
            5px;

          color:
            #8ab4f8;

          font-size:
            20px;

          font-weight:
            500;
        }


        .googlePreview p {
          max-width:
            680px;

          margin:
            0;

          color:
            #bdc1c6;

          font-size:
            11px;

          line-height:
            1.55;
        }


        .socialPreview {
          overflow:
            hidden;

          margin:
            17px;

          border:
            1px
            solid
            rgba(
              125,
              153,
              196,
              0.11
            );

          border-radius:
            13px;

          background:
            #0a1528;
        }


        .socialPreview img,
        .socialPlaceholder {
          width:
            100%;

          aspect-ratio:
            16
            /
            8;

          display:
            block;
        }


        .socialPreview img {
          object-fit:
            cover;
        }


        .socialPlaceholder {
          display:
            grid;

          place-items:
            center;

          background:
            rgba(
              255,
              255,
              255,
              0.02
            );

          color:
            #536985;

          font-size:
            8px;

          font-weight:
            900;
        }


        .socialContent {
          padding:
            13px;
        }


        .socialContent span {
          color:
            #687e9d;

          font-size:
            7px;

          font-weight:
            900;
        }


        .socialContent h3 {
          margin:
            5px
            0;

          font-size:
            14px;
        }


        .socialContent p {
          margin:
            0;

          color:
            #8094b1;

          font-size:
            9px;

          line-height:
            1.5;
        }


        .metadataSummary {
          padding:
            15px
            17px;
        }


        .metadataLine {
          display:
            grid;

          grid-template-columns:
            110px
            minmax(
              0,
              1fr
            );

          gap:
            12px;

          padding:
            9px
            0;

          border-bottom:
            1px
            solid
            rgba(
              125,
              153,
              196,
              0.06
            );
        }


        .metadataLine:last-child {
          border-bottom:
            0;
        }


        .metadataLine span {
          color:
            #687e9d;

          font-size:
            8px;
        }


        .metadataLine strong {
          overflow:
            hidden;

          color:
            #a7b7cc;

          font-size:
            8px;

          text-overflow:
            ellipsis;
        }


        @media (
          max-width:
            1000px
        ) {
          .seoLayout {
            grid-template-columns:
              1fr;
          }
        }


        @media (
          max-width:
            600px
        ) {
          .seoHeader {
            align-items:
              flex-start;

            flex-direction:
              column;
          }


          .metadataLine {
            grid-template-columns:
              1fr;
          }
        }
      `}</style>
    </>
  );
}


function SeoField({
  label,
  hint,
  children,
}: {
  label:
    string;

  hint:
    string;

  children:
    React.ReactNode;
}) {
  return (
    <label className="seoField">
      <div className="seoFieldTitle">
        <strong>
          {
            label
          }
        </strong>

        <span>
          {
            hint
          }
        </span>
      </div>


      {
        children
      }
    </label>
  );
}


function SeoCheck({
  good,
  text,
}: {
  good:
    boolean;

  text:
    string;
}) {
  return (
    <div
      className={
        good
          ? "seoCheck good"
          : "seoCheck"
      }
    >
      <span />

      {
        text
      }
    </div>
  );
}


function MetadataLine({
  label,
  value,
}: {
  label:
    string;

  value:
    string;
}) {
  return (
    <div className="metadataLine">
      <span>
        {
          label
        }
      </span>

      <strong>
        {
          value
        }
      </strong>
    </div>
  );
}