"use client";

import { useState } from "react";
import HeaderInput from "@/components/HeaderInput";
import ClassSelector from "@/components/ClassSelector";
import TestResultsDisplay from "@/components/TestResultsDisplay";

export default function Home() {
  const [headers, setHeaders] = useState<Record<string, string>>({});
  const [studentId, setStudentId] = useState<number | null>(null);
  const [classId, setClassId] = useState<number | null>(null);
  const [className, setClassName] = useState<string | null>(null);

  const handleHeadersProcessed = (
    processedHeaders: Record<string, string>,
    processedStudentId: number | null,
    processedClassId: number | null
  ) => {
    setHeaders(processedHeaders);
    setStudentId(processedStudentId);
    setClassId(processedClassId);
  };

  const handleClassSelected = (
    selectedClassId: number,
    selectedClassName: string
  ) => {
    setClassId(selectedClassId);
    setClassName(selectedClassName);
  };

  const handleStartOver = () => {
    window.location.reload();
  };

  return (
    <main className="main-container">
      <h1 className="main-heading">&quot;Game over man, game over!&quot;</h1>

      {!(headers && Object.keys(headers).length > 0 && studentId) && (
        <HeaderInput onHeadersProcessed={handleHeadersProcessed} />
      )}

      {headers && Object.keys(headers).length > 0 && studentId && (
        <>
          <ClassSelector
            headers={headers}
            studentId={studentId}
            classId={classId}
            onClassSelected={handleClassSelected}
          />

          <TestResultsDisplay
            headers={headers}
            classId={classId}
            className={className}
          />

          <button
            onClick={handleStartOver}
            className="button-primary start-over-button"
          >
            Start Over
          </button>
        </>
      )}
    </main>
  );
}
