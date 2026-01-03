"use client";

import { useState } from "react";
import { getAllTestResults, getTestDetails } from "@/app/services/tests";
import { getCoursePlan } from "@/app/services/classes";
import {
  TestDetailData,
  TestResultData,
  CoursePlanActivityData,
} from "@/app/types";
import { useQuery } from "@tanstack/react-query";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

type TestResultsDisplayProps = {
  headers: Record<string, string>;
  classId: number | null;
  className: string | null;
};

type WeekOption = {
  value: number;
  label: string;
};

export default function TestResultsDisplay({
  headers,
  classId,
  className,
}: TestResultsDisplayProps) {
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [expandedTestId, setExpandedTestId] = useState<number | null>(null);
  const [copiedTestId, setCopiedTestId] = useState<number | null>(null);
  const [clickedTests, setClickedTests] = useState<Set<number>>(new Set());

  const {
    data: coursePlan,
    isLoading: isLoadingCoursePlan,
    error: coursePlanError,
  } = useQuery<CoursePlanActivityData[]>({
    queryKey: ["coursePlan", headers, classId],
    queryFn: async () => {
      if (!headers || !classId) return [];
      const response = await getCoursePlan(headers, classId);
      console.log("Course plan response:", response);
      return response?.data || [];
    },
    enabled: !!headers && !!classId,
  });

  const {
    data: testResults,
    isLoading: isLoadingTestResults,
    error: testResultsError,
  } = useQuery<TestResultData[]>({
    queryKey: ["testResults", headers, classId, selectedWeek],
    queryFn: async () => {
      if (!headers || !classId || selectedWeek === null) return [];
      const response = await getAllTestResults(headers, classId, selectedWeek);
      console.log("Test results response:", response);
      return response?.data || [];
    },
    enabled: !!headers && !!classId && selectedWeek !== null,
  });

  const {
    data: detailedTest,
    isLoading: isLoadingDetailedTest,
    error: detailedTestError,
  } = useQuery<TestDetailData>({
    queryKey: ["detailedTest", expandedTestId, headers],
    queryFn: async () => {
      if (!expandedTestId || !headers) {
        throw new Error("ID hoặc headers không hợp lệ.");
      }
      const response = await getTestDetails(headers, expandedTestId);
      console.log("Detailed test response:", response);
      if (!response?.data || response.data.length === 0) {
        throw new Error("Không tìm thấy kết quả bài kiểm tra.");
      }
      return response.data[0];
    },
    enabled: !!expandedTestId && !!headers,
  });

  const handleTestClick = (testId: number) => {
    // Đánh dấu test đã được click
    setClickedTests(prev => new Set(prev).add(testId));
    
    if (expandedTestId === testId) {
      setExpandedTestId(null);
    } else {
      setExpandedTestId(testId);
    }
  };

  const handleCopyJson = async (testId: number, data: TestDetailData) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopiedTestId(testId);
      setTimeout(() => setCopiedTestId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const weeks: WeekOption[] = Array.from(
    new Set(coursePlan?.map((plan) => plan.week) || [])
  )
    .sort((a, b) => a - b)
    .map((week) => ({ value: week, label: `Tuần ${week}` }));

  return (
    <div className="card">
      <h2 className="card-title">
        {className ? className : "Chưa chọn môn học"}
      </h2>

      {isLoadingCoursePlan ? (
        <p className="loading-message">Đang tải danh sách tuần học...</p>
      ) : coursePlanError ? (
        <p className="error-message">
          Đã có lỗi xảy ra {coursePlanError.message}
        </p>
      ) : (
        <div className="form-group">
          <label htmlFor="week-select" className="form-label">
            Chọn tuần học:
          </label>
          <select
            id="week-select"
            className="select-input"
            value={selectedWeek || ""}
            onChange={(e) => setSelectedWeek(parseInt(e.target.value))}>
            <option value="">--- Chọn tuần học ---</option>
            {weeks.map((week) => (
              <option key={week.value} value={week.value}>
                {week.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {isLoadingTestResults ? (
        <p className="loading-message">Đang tải kết quả các bài kiểm tra...</p>
      ) : testResultsError ? (
        <p className="error-message">
          Đã có lỗi xảy ra: {testResultsError.message || "Lỗi không xác định"}
        </p>
      ) : selectedWeek && testResults && testResults.length > 0 ? (
        <div>
          <h3 className="section-title">
            Kết quả các bài kiểm tra cho tuần {selectedWeek}
          </h3>
          {testResults.map((test) => (
            <Accordion
              key={test.id}
              className={`test-accordion ${clickedTests.has(test.id) ? 'test-clicked' : ''}`}
              expanded={expandedTestId === test.id}
              onChange={() => handleTestClick(test.id)}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel${test.id}-content`}
                className="test-summary"
                id={`panel${test.id}-header`}>
                <Typography className="test-score">
                  Điểm: {(test.tong_diem / 10).toFixed(1)}
                </Typography>
                <Typography className="test-id">{`(ID: ${test.id})`}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {isLoadingDetailedTest && expandedTestId === test.id ? (
                  <p>Đang tải kết quả bài kiểm tra...</p>
                ) : detailedTestError && expandedTestId === test.id ? (
                  <p className="error-message">
                    Đã có lỗi xảy ra:{" "}
                    {detailedTestError.message || "Lỗi không xác định"}
                  </p>
                ) : (
                  expandedTestId === test.id &&
                  detailedTest && (
                    <div className="json-container">
                      <button
                        className="copy-json-button"
                        onClick={() => handleCopyJson(test.id, detailedTest)}
                        title="Copy JSON">
                        {copiedTestId === test.id ? (
                          <span className="copied-text">Đã copy</span>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                        )}
                      </button>
                      <pre className="json-display">
                        {JSON.stringify(detailedTest, null, 2)}
                      </pre>
                    </div>
                  )
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </div>
      ) : (
        selectedWeek && (
          <p>Chưa có kết quả bài kiểm tra nào cho tuần {selectedWeek}.</p>
        )
      )}
    </div>
  );
}
