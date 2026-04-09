import type { ApplyFieldConfig } from "../types/apply";

export const COMMON_FIELDS: ApplyFieldConfig[] = [
  {
    key: "name",
    label: "Name",
    type: "text",
    required: true,
    placeholder: "Your name",
  },
  {
    key: "discord",
    label: "Discord Username",
    type: "text",
    required: true,
    placeholder: "e.g. Name#1234",
  },
  {
    key: "age",
    label: "Age",
    type: "text",
    placeholder: "Your age",
  },
  {
    key: "timezone",
    label: "Timezone",
    type: "text",
    placeholder: "e.g. CET / GMT+1",
  },
  {
    key: "portfolioUrl",
    label: "Portfolio URL",
    type: "text",
    placeholder: "https://your-portfolio.com",
  },
  {
    key: "extraLinks",
    label: "Extra Links",
    type: "textarea",
    placeholder: "Add YouTube links, references, Discord links, etc.",
    minHeight: 120,
  },
  {
    key: "experience",
    label: "Experience",
    type: "textarea",
    placeholder: "Tell us about your experience",
    minHeight: 120,
  },
  {
    key: "motivation",
    label: "Motivation",
    type: "textarea",
    required: true,
    placeholder: "Why should we accept you?",
    minHeight: 150,
  },
  {
    key: "availability",
    label: "Availability",
    type: "text",
    placeholder: "e.g. 4 evenings a week",
  },
];

export const ROLE_FIELDS: Record<string, ApplyFieldConfig[]> = {
  Developer: [
    {
      key: "developerSkills",
      label: "Developer Skills",
      type: "textarea",
      required: true,
      placeholder: "Which languages, frameworks, tools or systems do you know?",
    },
    {
      key: "developerProjects",
      label: "Developer Projects",
      type: "textarea",
      required: true,
      placeholder: "Tell us about projects you worked on.",
    },
  ],
  Supporter: [
    {
      key: "supportCases",
      label: "Support Experience",
      type: "textarea",
      required: true,
      placeholder: "Tell us about moderation, support, or user issues.",
    },
    {
      key: "supportCommunication",
      label: "Communication Skills",
      type: "textarea",
      required: true,
      placeholder: "How do you deal with difficult users or conflict situations?",
    },
  ],
  "Competitive Manager": [
    {
      key: "competitiveKnowledge",
      label: "Competitive Knowledge",
      type: "textarea",
      required: true,
      placeholder: "Describe your knowledge of competitive systems, teams, or tournaments.",
    },
    {
      key: "competitivePlans",
      label: "Plans for Competitive",
      type: "textarea",
      required: true,
      placeholder: "What would you improve or build in the competitive area?",
    },
  ],
  Manager: [
    {
      key: "managerLeadership",
      label: "Leadership Experience",
      type: "textarea",
      required: true,
      placeholder: "Tell us about leadership, team handling, or project management.",
    },
    {
      key: "managerOrganization",
      label: "Organization Skills",
      type: "textarea",
      required: true,
      placeholder: "How do you organize people, tasks, and priorities?",
    },
  ],
  Director: [
    {
      key: "directorVision",
      label: "Vision",
      type: "textarea",
      required: true,
      placeholder: "What long-term vision would you bring to Auros?",
    },
    {
      key: "directorResponsibility",
      label: "Responsibility",
      type: "textarea",
      required: true,
      placeholder: "Why are you ready for a high-responsibility leadership role?",
    },
  ],
  Other: [
    {
      key: "otherStrengths",
      label: "Why do you fit this role?",
      type: "textarea",
      required: true,
      placeholder: "Tell us what makes you a good fit for this position.",
    },
  ],
};