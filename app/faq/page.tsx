"use client";

import {
  useMemo,
  useState,
} from "react";

type FAQCategory =
  | "general"
  | "map"
  | "applications";

type FAQItem = {
  question: string;
  answer: string;
};

type FAQSection = {
  id: FAQCategory;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
  items: FAQItem[];
};

const faqSections: FAQSection[] = [
  {
    id: "general",
    label: "General & Community",
    shortLabel: "Community",
    description:
      "Everything about Auros, community updates, news, patchnotes and the website.",
    icon: "◆",
    items: [
      {
        question: "What is Auros?",
        answer:
          "Auros is a custom Battle Royale experience built in UEFN, featuring its own evolving island, gameplay systems, story, locations, events, and seasonal updates.",
      },
      {
        question: "Where can I find the latest Auros news?",
        answer:
          "Major announcements, development updates, community information, and other Auros news are published in the News section of the website.",
      },
      {
        question: "Where can I find the latest patchnotes?",
        answer:
          "All major Auros Website updates are documented in the Patchnotes section, including new features, improvements, changes, and fixes.",
      },
      {
        question: "What is the Auros Gallery?",
        answer:
          "The Gallery is a collection of screenshots and visual content from Auros. New images can be added as the island and the project continue to evolve.",
      },
      {
        question: "How often is the Auros website updated?",
        answer:
          "The Auros website is continuously developed. Larger features are usually released through versioned updates, while smaller improvements and fixes may arrive between larger releases.",
      },
      {
        question: "Where can I report a website bug?",
        answer:
          "If you discover a bug or problem on the Auros website, you can report it through the official Auros community channels. Please include information about what happened and, if possible, how the issue can be reproduced.",
      },
    ],
  },

  {
    id: "map",
    label: "Map & Website",
    shortLabel: "Map",
    description:
      "Learn how the Interactive Map, Map Archive, Timeline and other website systems work.",
    icon: "⌖",
    items: [
      {
        question: "What is the Interactive Map?",
        answer:
          "The Interactive Map allows you to explore the Auros island directly through the website. You can zoom, move around the map, open locations, use filters, and explore important places across Auros.",
      },
      {
        question: "What locations can appear on the map?",
        answer:
          "The map supports different location types including POIs, Landmarks, Story Locations, Event Locations, Spawn Locations, and other important places.",
      },
      {
        question: "Can I search for locations?",
        answer:
          "Yes. The location search can find locations across published Auros maps and automatically open the correct map version and selected location.",
      },
      {
        question: "Can I view older versions of the Auros map?",
        answer:
          "Yes. The Map Archive allows you to explore previous published versions of the Auros island instead of only showing the current version.",
      },
      {
        question: "What is the Map Timeline?",
        answer:
          "The Map Timeline shows the history of published Auros maps and makes it easier to see how the island has evolved across updates, Ventures, and Seasons.",
      },
      {
        question: "What is Map Compare?",
        answer:
          "Map Compare allows you to select two different Auros map versions and compare them directly using an interactive slider.",
      },
      {
        question: "Can I open the map in fullscreen?",
        answer:
          "Yes. The Interactive Map includes a fullscreen mode alongside zoom and movement controls for a larger and more detailed view of the island.",
      },
    ],
  },

  {
    id: "applications",
    label: "Applications",
    shortLabel: "Applications",
    description:
      "Information about joining the Auros team, applications, tracking codes and application status.",
    icon: "◇",
    items: [
      {
        question: "Can I join the Auros development team?",
        answer:
          "When positions are available, they will appear on the Apply page. Available roles may change depending on what the Auros project currently needs.",
      },
      {
        question: "How do I apply for an Auros role?",
        answer:
          "Go to the Apply page, choose an open role, complete the application form, and submit your application.",
      },
      {
        question: "How can I check my application status?",
        answer:
          "Use the Status page and enter the email address used for your application together with your tracking code.",
      },
      {
        question: "What is a tracking code?",
        answer:
          "A tracking code is generated after you submit an application. Keep it somewhere safe because you will need it together with your email address to check your application status.",
      },
      {
        question: "How long does the review process take?",
        answer:
          "Review times can vary depending on the number of applications, the position, and the current development workload. There is no guaranteed review time.",
      },
      {
        question: "Can I apply for more than one role?",
        answer:
          "Yes, but every application should be serious and relevant to the specific role you are applying for.",
      },
      {
        question: "Do I need previous experience?",
        answer:
          "Not always. Some roles benefit from previous experience, but motivation, reliability, communication, and willingness to improve are also important.",
      },
    ],
  },
];

export default function FAQPage() {
  const [
    activeCategory,
    setActiveCategory,
  ] =
    useState<FAQCategory>(
      "general"
    );

  const [
    openQuestion,
    setOpenQuestion,
  ] =
    useState<string | null>(
      null
    );

  const activeSection =
    useMemo(() => {
      return (
        faqSections.find(
          (section) =>
            section.id ===
            activeCategory
        ) ??
        faqSections[0]
      );
    }, [
      activeCategory,
    ]);

  function selectCategory(
    category: FAQCategory
  ) {
    setActiveCategory(
      category
    );

    setOpenQuestion(
      null
    );
  }

  function toggleQuestion(
    question: string
  ) {
    setOpenQuestion(
      (current) =>
        current ===
        question
          ? null
          : question
    );
  }

  return (
    <>
      <main className="faqPage">
        {/* HERO */}

        <section className="faqHero">
          <div className="faqHeroGlow" />

          <div className="faqHeroContent">
            <div className="faqOverline">
              <span className="faqOverlineDot" />

              AUROS SUPPORT
            </div>

            <h1>
              Frequently Asked
              <br />
              Questions
            </h1>

            <p>
              Find answers about Auros,
              the community, our
              Interactive Map, website
              features, applications,
              and more.
            </p>
          </div>

          <div className="faqHeroStats">
            <div>
              <span>
                {
                  faqSections.length
                }
              </span>

              <small>
                CATEGORIES
              </small>
            </div>

            <div>
              <span>
                {faqSections.reduce(
                  (
                    total,
                    section
                  ) =>
                    total +
                    section.items
                      .length,
                  0
                )}
              </span>

              <small>
                QUESTIONS
              </small>
            </div>
          </div>
        </section>

        {/* CATEGORY HEADER */}

        <section className="faqCategorySection">
          <div className="faqSectionHeader">
            <div>
              <span>
                FAQ CATEGORIES
              </span>

              <h2>
                What can we help
                you with?
              </h2>
            </div>

            <p>
              Select a category to
              quickly find the
              information you're
              looking for.
            </p>
          </div>

          {/* CATEGORY CARDS */}

          <div className="faqCategories">
            {faqSections.map(
              (section) => {
                const active =
                  activeCategory ===
                  section.id;

                return (
                  <button
                    key={
                      section.id
                    }
                    type="button"
                    className={
                      active
                        ? "faqCategoryCard active"
                        : "faqCategoryCard"
                    }
                    onClick={() =>
                      selectCategory(
                        section.id
                      )
                    }
                  >
                    <div className="faqCategoryTop">
                      <span className="faqCategoryIcon">
                        {
                          section.icon
                        }
                      </span>

                      <span className="faqCategoryCount">
                        {
                          section
                            .items
                            .length
                        }{" "}
                        QUESTIONS
                      </span>
                    </div>

                    <strong>
                      {
                        section.label
                      }
                    </strong>

                    <p>
                      {
                        section.description
                      }
                    </p>

                    <div className="faqCategoryBottom">
                      <span>
                        Explore
                      </span>

                      <span>
                        →
                      </span>
                    </div>
                  </button>
                );
              }
            )}
          </div>
        </section>

        {/* QUESTIONS */}

        <section className="faqQuestionsSection">
          <div className="faqQuestionsHeader">
            <div className="faqQuestionsTitle">
              <span className="faqQuestionsIcon">
                {
                  activeSection.icon
                }
              </span>

              <div>
                <small>
                  CURRENT CATEGORY
                </small>

                <h2>
                  {
                    activeSection.label
                  }
                </h2>
              </div>
            </div>

            <div className="faqQuestionsCount">
              {
                activeSection.items
                  .length
              }{" "}
              QUESTIONS
            </div>
          </div>

          <div className="faqQuestionList">
            {activeSection.items.map(
              (
                item,
                index
              ) => {
                const open =
                  openQuestion ===
                  item.question;

                return (
                  <article
                    key={
                      item.question
                    }
                    className={
                      open
                        ? "faqQuestion open"
                        : "faqQuestion"
                    }
                  >
                    <button
                      type="button"
                      className="faqQuestionButton"
                      onClick={() =>
                        toggleQuestion(
                          item.question
                        )
                      }
                    >
                      <div className="faqQuestionNumber">
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </div>

                      <span className="faqQuestionText">
                        {
                          item.question
                        }
                      </span>

                      <span className="faqQuestionToggle">
                        {open
                          ? "−"
                          : "+"}
                      </span>
                    </button>

                    <div className="faqAnswer">
                      <div className="faqAnswerInner">
                        <div className="faqAnswerLine" />

                        <p>
                          {
                            item.answer
                          }
                        </p>
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        </section>

        {/* FOOTER INFO */}

        <section className="faqHelpCard">
          <div>
            <span>
              STILL NEED HELP?
            </span>

            <h2>
              Couldn't find your
              answer?
            </h2>

            <p>
              Additional information,
              announcements, and
              updates can be found
              through the official
              Auros community channels.
            </p>
          </div>

          <div className="faqHelpBadge">
            <span>
              AUROS
            </span>

            <strong>
              COMMUNITY
            </strong>
          </div>
        </section>
      </main>

      <style jsx global>{`
        .faqPage {
          width: 100%;

          display: grid;

          gap: 22px;

          padding-bottom: 40px;
        }

        /* =========================================
           HERO
        ========================================== */

        .faqHero {
          position: relative;

          min-height: 280px;

          display: flex;

          align-items: flex-end;
          justify-content: space-between;

          gap: 40px;

          overflow: hidden;

          padding: 38px;

          border:
            1px solid
            rgba(
              104,
              149,
              213,
              0.15
            );

          border-radius: 24px;

          background:
            radial-gradient(
              circle at 78% 30%,
              rgba(
                58,
                204,
                255,
                0.1
              ),
              transparent
                38%
            ),
            linear-gradient(
              135deg,
              rgba(
                14,
                29,
                58,
                0.94
              ),
              rgba(
                7,
                15,
                31,
                0.97
              )
            );

          box-shadow:
            0 28px 70px
            rgba(
              0,
              0,
              0,
              0.22
            );
        }

        .faqHeroGlow {
          position: absolute;

          width: 420px;
          height: 420px;

          right: -140px;
          top: -200px;

          border-radius: 50%;

          background:
            rgba(
              67,
              211,
              255,
              0.11
            );

          filter: blur(70px);

          pointer-events: none;
        }

        .faqHeroContent {
          position: relative;

          z-index: 2;

          max-width: 760px;
        }

        .faqOverline {
          display: flex;

          align-items: center;

          gap: 8px;

          margin-bottom: 16px;

          color: #63ddff;

          font-size: 9px;
          font-weight: 900;

          letter-spacing:
            0.14em;
        }

        .faqOverlineDot {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background:
            #63ddff;

          box-shadow:
            0 0 12px
            rgba(
              99,
              221,
              255,
              0.75
            );
        }

        .faqHero h1 {
          margin: 0;

          color: #f2f7ff;

          font-size:
            clamp(
              42px,
              5vw,
              68px
            );

          line-height: 0.98;

          letter-spacing:
            -0.045em;
        }

        .faqHero p {
          max-width: 680px;

          margin:
            20px
            0
            0;

          color: #91a5c4;

          font-size: 15px;

          line-height: 1.7;
        }

        .faqHeroStats {
          position: relative;

          z-index: 2;

          display: flex;

          gap: 8px;
        }

        .faqHeroStats > div {
          min-width: 105px;

          padding:
            16px
            18px;

          border:
            1px solid
            rgba(
              109,
              153,
              214,
              0.13
            );

          border-radius: 14px;

          background:
            rgba(
              4,
              11,
              25,
              0.7
            );

          backdrop-filter:
            blur(9px);
        }

        .faqHeroStats span {
          display: block;

          color: white;

          font-size: 24px;
          font-weight: 900;
        }

        .faqHeroStats small {
          display: block;

          margin-top: 5px;

          color: #5f7799;

          font-size: 7px;
          font-weight: 900;

          letter-spacing:
            0.1em;
        }

        /* =========================================
           CATEGORY SECTION
        ========================================== */

        .faqCategorySection,
        .faqQuestionsSection {
          padding: 24px;

          border:
            1px solid
            rgba(
              104,
              149,
              213,
              0.14
            );

          border-radius: 22px;

          background:
            rgba(
              10,
              22,
              44,
              0.83
            );

          box-shadow:
            0 24px 60px
            rgba(
              0,
              0,
              0,
              0.18
            );

          backdrop-filter:
            blur(10px);
        }

        .faqSectionHeader {
          display: flex;

          align-items: flex-end;
          justify-content: space-between;

          gap: 30px;

          margin-bottom: 20px;
        }

        .faqSectionHeader
          > div
          > span {
          color: #63ddff;

          font-size: 8px;
          font-weight: 900;

          letter-spacing:
            0.12em;
        }

        .faqSectionHeader h2 {
          margin:
            6px
            0
            0;

          color: #edf5ff;

          font-size: 26px;
        }

        .faqSectionHeader
          > p {
          max-width: 430px;

          margin: 0;

          color: #7187a8;

          font-size: 11px;

          line-height: 1.6;
        }

        /* =========================================
           CATEGORY CARDS
        ========================================== */

        .faqCategories {
          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(
                0,
                1fr
              )
            );

          gap: 12px;
        }

        .faqCategoryCard {
          position: relative;

          min-height: 205px;

          display: flex;

          flex-direction: column;

          align-items: stretch;

          padding: 18px;

          overflow: hidden;

          text-align: left;

          border:
            1px solid
            rgba(
              110,
              150,
              208,
              0.13
            );

          border-radius: 16px;

          background:
            linear-gradient(
              145deg,
              rgba(
                9,
                20,
                40,
                0.95
              ),
              rgba(
                5,
                13,
                28,
                0.96
              )
            );

          color: white;

          cursor: pointer;

          transition:
            transform
              0.16s
              ease,
            border-color
              0.16s
              ease,
            background
              0.16s
              ease;
        }

        .faqCategoryCard:hover {
          transform:
            translateY(
              -2px
            );

          border-color:
            rgba(
              99,
              221,
              255,
              0.27
            );
        }

        .faqCategoryCard.active {
          border-color:
            rgba(
              99,
              221,
              255,
              0.45
            );

          background:
            linear-gradient(
              145deg,
              rgba(
                19,
                49,
                71,
                0.88
              ),
              rgba(
                6,
                19,
                36,
                0.98
              )
            );

          box-shadow:
            inset
              0
              0
              0
              1px
              rgba(
                99,
                221,
                255,
                0.06
              ),
            0
              12px
              30px
              rgba(
                33,
                181,
                230,
                0.07
              );
        }

        .faqCategoryTop {
          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 10px;

          margin-bottom: 22px;
        }

        .faqCategoryIcon {
          width: 38px;
          height: 38px;

          display: grid;
          place-items: center;

          border:
            1px solid
            rgba(
              99,
              221,
              255,
              0.2
            );

          border-radius: 10px;

          background:
            rgba(
              99,
              221,
              255,
              0.08
            );

          color: #63ddff;

          font-size: 15px;
          font-weight: 900;
        }

        .faqCategoryCount {
          color: #526b8e;

          font-size: 7px;
          font-weight: 900;

          letter-spacing:
            0.09em;
        }

        .faqCategoryCard
          > strong {
          color: #edf5ff;

          font-size: 17px;

          margin-bottom: 8px;
        }

        .faqCategoryCard
          > p {
          flex: 1;

          margin: 0;

          color: #7489a8;

          font-size: 9px;

          line-height: 1.6;
        }

        .faqCategoryBottom {
          display: flex;

          align-items: center;
          justify-content: space-between;

          margin-top: 20px;

          padding-top: 12px;

          border-top:
            1px solid
            rgba(
              106,
              148,
              207,
              0.08
            );

          color: #6380a4;

          font-size: 8px;
          font-weight: 800;
        }

        .faqCategoryCard.active
          .faqCategoryBottom {
          color: #63ddff;
        }

        /* =========================================
           QUESTIONS
        ========================================== */

        .faqQuestionsHeader {
          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 20px;

          margin-bottom: 18px;
        }

        .faqQuestionsTitle {
          display: flex;

          align-items: center;

          gap: 12px;
        }

        .faqQuestionsIcon {
          width: 42px;
          height: 42px;

          display: grid;
          place-items: center;

          border:
            1px solid
            rgba(
              99,
              221,
              255,
              0.2
            );

          border-radius: 11px;

          background:
            rgba(
              99,
              221,
              255,
              0.08
            );

          color: #63ddff;

          font-size: 16px;
        }

        .faqQuestionsTitle small {
          display: block;

          color: #526b8e;

          font-size: 7px;
          font-weight: 900;

          letter-spacing:
            0.11em;
        }

        .faqQuestionsTitle h2 {
          margin:
            4px
            0
            0;

          color: #edf5ff;

          font-size: 22px;
        }

        .faqQuestionsCount {
          padding:
            7px
            10px;

          border:
            1px solid
            rgba(
              99,
              221,
              255,
              0.15
            );

          border-radius: 999px;

          background:
            rgba(
              99,
              221,
              255,
              0.05
            );

          color: #63ddff;

          font-size: 7px;
          font-weight: 900;

          letter-spacing:
            0.08em;
        }

        .faqQuestionList {
          display: grid;

          gap: 9px;
        }

        .faqQuestion {
          overflow: hidden;

          border:
            1px solid
            rgba(
              108,
              150,
              209,
              0.13
            );

          border-radius: 14px;

          background:
            rgba(
              5,
              14,
              30,
              0.74
            );

          transition:
            border-color
              0.16s
              ease,
            background
              0.16s
              ease;
        }

        .faqQuestion:hover {
          border-color:
            rgba(
              99,
              221,
              255,
              0.22
            );
        }

        .faqQuestion.open {
          border-color:
            rgba(
              99,
              221,
              255,
              0.32
            );

          background:
            rgba(
              7,
              20,
              39,
              0.92
            );
        }

        .faqQuestionButton {
          width: 100%;

          min-height: 68px;

          display: grid;

          grid-template-columns:
            42px
            minmax(
              0,
              1fr
            )
            34px;

          align-items: center;

          gap: 13px;

          padding:
            12px
            14px;

          border: 0;

          background:
            transparent;

          color: white;

          text-align: left;

          cursor: pointer;
        }

        .faqQuestionNumber {
          color: #526b8e;

          font-size: 8px;
          font-weight: 900;

          letter-spacing:
            0.08em;
        }

        .faqQuestion.open
          .faqQuestionNumber {
          color: #63ddff;
        }

        .faqQuestionText {
          color: #e4edf9;

          font-size: 12px;
          font-weight: 850;
        }

        .faqQuestionToggle {
          width: 30px;
          height: 30px;

          display: grid;

          place-items: center;

          justify-self: end;

          border:
            1px solid
            rgba(
              110,
              150,
              208,
              0.13
            );

          border-radius: 8px;

          background:
            rgba(
              255,
              255,
              255,
              0.025
            );

          color: #6d84a5;

          font-size: 16px;

          transition:
            color
              0.16s
              ease,
            border-color
              0.16s
              ease,
            background
              0.16s
              ease;
        }

        .faqQuestion.open
          .faqQuestionToggle {
          border-color:
            rgba(
              99,
              221,
              255,
              0.24
            );

          background:
            rgba(
              99,
              221,
              255,
              0.08
            );

          color: #63ddff;
        }

        .faqAnswer {
          display: grid;

          grid-template-rows:
            0fr;

          opacity: 0;

          transition:
            grid-template-rows
              0.2s
              ease,
            opacity
              0.18s
              ease;
        }

        .faqQuestion.open
          .faqAnswer {
          grid-template-rows:
            1fr;

          opacity: 1;
        }

        .faqAnswerInner {
          min-height: 0;

          display: grid;

          grid-template-columns:
            2px
            minmax(
              0,
              1fr
            );

          gap: 13px;

          overflow: hidden;

          margin:
            0
            14px;

          padding:
            0
            0
            16px
            55px;
        }

        .faqAnswerLine {
          width: 2px;

          border-radius: 999px;

          background:
            linear-gradient(
              to bottom,
              #63ddff,
              rgba(
                99,
                221,
                255,
                0.05
              )
            );
        }

        .faqAnswer p {
          margin: 0;

          color: #8398b8;

          font-size: 10px;

          line-height: 1.7;
        }

        /* =========================================
           HELP CARD
        ========================================== */

        .faqHelpCard {
          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 30px;

          padding:
            26px
            28px;

          border:
            1px solid
            rgba(
              99,
              221,
              255,
              0.16
            );

          border-radius: 20px;

          background:
            linear-gradient(
              110deg,
              rgba(
                13,
                34,
                60,
                0.9
              ),
              rgba(
                6,
                16,
                33,
                0.94
              )
            );
        }

        .faqHelpCard
          > div:first-child
          > span {
          color: #63ddff;

          font-size: 8px;
          font-weight: 900;

          letter-spacing:
            0.12em;
        }

        .faqHelpCard h2 {
          margin:
            6px
            0;

          color: white;

          font-size: 23px;
        }

        .faqHelpCard p {
          max-width: 600px;

          margin: 0;

          color: #7f94b3;

          font-size: 10px;

          line-height: 1.65;
        }

        .faqHelpBadge {
          min-width: 150px;

          padding:
            16px
            18px;

          border:
            1px solid
            rgba(
              99,
              221,
              255,
              0.13
            );

          border-radius: 13px;

          background:
            rgba(
              3,
              12,
              26,
              0.66
            );
        }

        .faqHelpBadge span,
        .faqHelpBadge strong {
          display: block;
        }

        .faqHelpBadge span {
          color: #526d91;

          font-size: 7px;
          font-weight: 900;

          letter-spacing:
            0.12em;
        }

        .faqHelpBadge strong {
          margin-top: 4px;

          color: #63ddff;

          font-size: 13px;
        }

        /* =========================================
           RESPONSIVE
        ========================================== */

        @media (
          max-width: 900px
        ) {
          .faqHero {
            align-items:
              flex-start;

            flex-direction:
              column;
          }

          .faqHeroStats {
            width: 100%;
          }

          .faqHeroStats
            > div {
            flex: 1;
          }

          .faqCategories {
            grid-template-columns:
              1fr;
          }

          .faqCategoryCard {
            min-height:
              180px;
          }
        }

        @media (
          max-width: 700px
        ) {
          .faqHero,
          .faqCategorySection,
          .faqQuestionsSection {
            padding: 18px;

            border-radius:
              17px;
          }

          .faqHero {
            min-height: 0;
          }

          .faqHero h1 {
            font-size:
              39px;
          }

          .faqHeroStats {
            gap: 6px;
          }

          .faqHeroStats
            > div {
            min-width: 0;
          }

          .faqSectionHeader {
            align-items:
              flex-start;

            flex-direction:
              column;
          }

          .faqSectionHeader
            > p {
            max-width:
              none;
          }

          .faqQuestionsHeader {
            align-items:
              flex-start;
          }

          .faqQuestionsCount {
            display: none;
          }

          .faqQuestionButton {
            grid-template-columns:
              28px
              minmax(
                0,
                1fr
              )
              32px;

            gap: 9px;

            padding:
              12px;
          }

          .faqAnswerInner {
            padding-left:
              40px;

            margin:
              0
              12px;
          }

          .faqHelpCard {
            align-items:
              flex-start;

            flex-direction:
              column;

            padding: 20px;
          }

          .faqHelpBadge {
            width: 100%;
          }
        }

        @media (
          max-width: 460px
        ) {
          .faqHeroStats {
            display: grid;

            grid-template-columns:
              1fr
              1fr;
          }

          .faqQuestionNumber {
            display: none;
          }

          .faqQuestionButton {
            grid-template-columns:
              minmax(
                0,
                1fr
              )
              32px;
          }

          .faqAnswerInner {
            padding-left: 0;
          }
        }

        @media (
          prefers-reduced-motion:
            reduce
        ) {
          .faqCategoryCard,
          .faqQuestion,
          .faqQuestionToggle,
          .faqAnswer {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}