"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { COMMON_FIELDS, ROLE_FIELDS } from "../lib/apply-form-config";
import type { ApplyFormValues, Job } from "../types/apply";

function createTrackingCode() {
  return `AU-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Date.now()
    .toString()
    .slice(-6)}`;
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function useApplyForm() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobId, setJobId] = useState("");
  const [values, setValues] = useState<ApplyFormValues>({});
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [submittedCode, setSubmittedCode] = useState("");
  const [submittedRole, setSubmittedRole] = useState("");
  const [copiedTrackingCode, setCopiedTrackingCode] = useState(false);

  async function loadJobs() {
    const { data, error } = await supabase
      .from("jobs")
      .select(
        "id, title, department, type, location, description, requirements, status, role_category"
      )
      .eq("status", "Open")
      .order("title", { ascending: true });

    if (error) {
      console.log(error);
      return;
    }

    const nextJobs = (data as Job[]) || [];
    setJobs(nextJobs);

    if (nextJobs.length > 0) {
      setJobId((prev) => prev || nextJobs[0].id);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  const selectedJob = useMemo(() => {
    return jobs.find((job) => job.id === jobId) || null;
  }, [jobs, jobId]);

  const selectedCategory = selectedJob?.role_category || "Other";

  const roleFields = useMemo(() => {
    return ROLE_FIELDS[selectedCategory] || ROLE_FIELDS.Other || [];
  }, [selectedCategory]);

  function setValue(key: string, value: string) {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function validateFields() {
    const allFields = [...COMMON_FIELDS, ...roleFields];
    const requiredFields = allFields.filter((field) => field.required);

    for (const field of requiredFields) {
      const value = values[field.key]?.trim() || "";
      if (!value) {
        alert(`Please fill in: ${field.label}`);
        return false;
      }
    }

    if (!jobId) {
      alert("Please select a role.");
      return false;
    }

    return true;
  }

  async function copyTrackingCode() {
    if (!submittedCode) return;

    try {
      await navigator.clipboard.writeText(submittedCode);
      setCopiedTrackingCode(true);

      window.setTimeout(() => {
        setCopiedTrackingCode(false);
      }, 2000);
    } catch (error) {
      console.log("Copy failed:", error);
      alert("Could not copy the tracking code.");
    }
  }

  async function uploadAttachment(trackingCode: string, discordKey: string) {
    if (!attachmentFile) {
      return {
        attachment_url: null,
        attachment_type: null,
        attachment_name: null,
      };
    }

    const sanitizedName = safeFileName(attachmentFile.name);
    const filePath =
      `${discordKey}/${trackingCode}/${Date.now()}-${sanitizedName}`.replace(
        /\s+/g,
        "_"
      );

    const { error: uploadError } = await supabase.storage
      .from("application-attachments")
      .upload(filePath, attachmentFile, {
        upsert: false,
        contentType: attachmentFile.type || undefined,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("application-attachments")
      .getPublicUrl(filePath);

    return {
      attachment_url: data?.publicUrl || null,
      attachment_type: attachmentFile.type || null,
      attachment_name: attachmentFile.name || null,
    };
  }

  async function submitApplication() {
    if (!validateFields()) return;

    setLoading(true);

    try {
      const trackingCode = createTrackingCode().trim().toUpperCase();
      const discordValue = values.discord?.trim() || "";
      const discordKey =
        discordValue.replace(/[^a-zA-Z0-9._-]/g, "_").toLowerCase() || "unknown-user";

      const uploadResult = await uploadAttachment(trackingCode, discordKey);

      const payload = {
        job_id: jobId,
        name: values.name?.trim() || "",
        discord: discordValue,
        age: values.age?.trim() || "",
        timezone: values.timezone?.trim() || "",
        experience: values.experience?.trim() || "",
        motivation: values.motivation?.trim() || "",
        availability: values.availability?.trim() || "",
        developer_skills: values.developerSkills?.trim() || "",
        developer_projects: values.developerProjects?.trim() || "",
        support_cases: values.supportCases?.trim() || "",
        support_communication: values.supportCommunication?.trim() || "",
        competitive_knowledge: values.competitiveKnowledge?.trim() || "",
        competitive_plans: values.competitivePlans?.trim() || "",
        manager_leadership: values.managerLeadership?.trim() || "",
        manager_organization: values.managerOrganization?.trim() || "",
        director_vision: values.directorVision?.trim() || "",
        director_responsibility: values.directorResponsibility?.trim() || "",
        other_strengths: values.otherStrengths?.trim() || "",
        tracking_code: trackingCode,
        status: "New",
        score: 0,
        portfolio_url: values.portfolioUrl?.trim() || null,
        extra_links: values.extraLinks?.trim() || null,
        attachment_url: uploadResult.attachment_url,
        attachment_type: uploadResult.attachment_type,
        attachment_name: uploadResult.attachment_name,
        extra_answers: values,
      };

      const { error } = await supabase.from("applications").insert(payload);

      if (error) {
        console.log(error);
        alert("Error submitting application");
        return;
      }

      try {
        await fetch("/api/notify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jobTitle: selectedJob?.title || "-",
            category: selectedCategory,
            name: values.name?.trim() || "",
            discord: discordValue,
            age: values.age?.trim() || "",
            timezone: values.timezone?.trim() || "",
            experience: values.experience?.trim() || "",
            motivation: values.motivation?.trim() || "",
            availability: values.availability?.trim() || "",
            trackingCode,
            portfolioUrl: values.portfolioUrl?.trim() || "",
            extraLinks: values.extraLinks?.trim() || "",
            attachmentUrl: uploadResult.attachment_url,
            attachmentType: uploadResult.attachment_type,
            attachmentName: uploadResult.attachment_name,
            extraAnswers: values,
          }),
        });
      } catch (error) {
        console.log("Notify request failed:", error);
      }

      setSubmittedCode(trackingCode);
      setSubmittedRole(selectedJob?.title || "Role");
      setCopiedTrackingCode(false);
      setValues({});
      setAttachmentFile(null);

      if (jobs.length > 0) {
        setJobId(jobs[0].id);
      }
    } catch (error) {
      console.log("Submit failed:", error);
      alert("Something went wrong while submitting the application.");
    } finally {
      setLoading(false);
    }
  }

  function resetSubmission() {
    setSubmittedCode("");
    setSubmittedRole("");
    setCopiedTrackingCode(false);
  }

  return {
    jobs,
    jobId,
    setJobId,
    values,
    setValue,
    selectedJob,
    selectedCategory,
    commonFields: COMMON_FIELDS,
    roleFields,
    attachmentFile,
    setAttachmentFile,
    loading,
    submittedCode,
    submittedRole,
    copiedTrackingCode,
    copyTrackingCode,
    submitApplication,
    resetSubmission,
  };
}