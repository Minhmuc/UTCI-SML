"use client";

import { useState, useEffect } from "react";
import { getAllClasses, getClassDetails } from "@/app/services/classes";
import { ClassStudentData, ClassDetailData } from "@/app/types";
import { useQuery } from "@tanstack/react-query";

type ClassSelectorProps = {
  headers: Record<string, string>;
  studentId: number | null;
  classId: number | null;
  onClassSelected: (classId: number, className: string) => void;
};

export default function ClassSelector({
  headers,
  studentId,
  classId,
  onClassSelected,
}: ClassSelectorProps) {
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

  const [isSetClassFromHeaders, setIsSetClassFromHeaders] = useState(false);

  const {
    data: allClasses,
    isLoading: isLoadingClasses,
    error: classesError,
  } = useQuery<ClassStudentData[]>({
    queryKey: ["classes", headers, studentId],
    queryFn: async () => {
      if (!headers || !studentId) return [];
      const response = await getAllClasses(headers, studentId);
      return response?.data || [];
    },
    enabled: !!headers && studentId !== null,
  });

  const {
    data: classDetails,
    isLoading: isLoadingClassDetails,
    error: classDetailsError,
  } = useQuery<ClassDetailData[]>({
    queryKey: [
      "classDetails",
      allClasses,
      selectedYear,
      selectedSemester,
      headers,
    ],
    queryFn: async () => {
      if (!allClasses || !headers || !selectedYear || !selectedSemester)
        return [];
      const filteredClasses = allClasses.filter(
        (cls) => cls.namhoc === selectedYear && cls.hocky === selectedSemester
      );
      const classDetailsPromises = filteredClasses.map((cls) =>
        getClassDetails(headers, cls.class_id)
      );

      const classDetailsResponses = await Promise.all(classDetailsPromises);
      return classDetailsResponses.map((response) => response.data);
    },
    enabled: !!allClasses && !!headers && !!selectedYear && !!selectedSemester,
  });

  useEffect(() => {
    if (selectedClassId && classDetails) {
      const selectedClassDetail = classDetails?.find(
        (cls) => cls.id === selectedClassId
      );

      onClassSelected(
        selectedClassId,
        selectedClassDetail?.name || `Class ID: ${selectedClassId}`
      );
    }
  }, [selectedClassId, classDetails, onClassSelected]);

  const years = allClasses
    ? Array.from(new Set(allClasses.map((c) => c.namhoc))).map((year) => ({
        value: year,
        label: year,
      }))
    : [];

  const semesters = allClasses
    ? Array.from(
        new Set(
          allClasses
            .filter((c) => c.namhoc === selectedYear)
            .map((c) => c.hocky)
        )
      )
        .sort((a, b) => a - b)
        .map((semester) => ({ value: semester, label: `Học kỳ ${semester}` }))
    : [];

  const classesForSelection = allClasses
    ? allClasses
        .filter(
          (c) => c.namhoc === selectedYear && c.hocky === selectedSemester
        )
        .map((c) => ({
          value: c.class_id,
          label: (() => {
            const classDetail = classDetails?.find(
              (cls) => cls.id === c.class_id
            );
            return classDetail ? classDetail.name : `Môn học ID: ${c.class_id}`;
          })(),
        }))
    : [];

  useEffect(() => {
    console.log(isSetClassFromHeaders, allClasses, classId);
    if (!isSetClassFromHeaders && allClasses && classId) {
      const currentClass = allClasses.find((cls) => cls.class_id === classId);
      if (currentClass) {
        setSelectedYear(currentClass.namhoc.toString());
        setSelectedSemester(currentClass.hocky);
        setSelectedClassId(classId);
        setIsSetClassFromHeaders(true);
      }
    } else {
      setSelectedYear("");
      setSelectedSemester(null);
      setSelectedClassId(null);
    }
  }, [allClasses, classId, isSetClassFromHeaders]);

  useEffect(() => {
    setIsSetClassFromHeaders(false);
  }, [headers]);

  const handleClassSelect = (classId: number) => {
    setSelectedClassId(classId);
  };

  return (
    <div className="card">
      <h2 className="card-title">Chọn môn học</h2>
      {isLoadingClasses ? (
        <p className="loading-message">Đang tải danh sách lớp học</p>
      ) : classesError ? (
        <p className="error-message">
          Đã có lỗi xảy ra: {classesError.message}
        </p>
      ) : (
        <div className="form-group">
          <label htmlFor="year-select" className="form-label">
            Năm học:
          </label>
          <select
            id="year-select"
            className="select-input"
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setSelectedSemester(null);
              setSelectedClassId(null);
            }}
            disabled={years.length === 0}>
            {years.length === 0 ? (
              <option value="">Không có năm học nào</option>
            ) : (
              <>
                <option value="">--- Chọn năm học ---</option>
                {years.map((year) => (
                  <option key={year.value} value={year.value}>
                    {year.label}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
      )}

      {
        <div className="form-group">
          <label htmlFor="semester-select" className="form-label">
            Học kỳ:
          </label>
          <select
            id="semester-select"
            className="select-input"
            value={selectedSemester || ""}
            onChange={(e) => {
              setSelectedSemester(parseInt(e.target.value));
              setSelectedClassId(null);
            }}
            disabled={!selectedYear || semesters.length === 0}>
            {semesters.length === 0 ? (
              <option value="">Không có học kỳ nào</option>
            ) : (
              <>
                <option value="">--- Chọn học kỳ ---</option>
                {semesters.map((semester) => (
                  <option key={semester.value} value={semester.value}>
                    {semester.label}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
      }

      {isLoadingClassDetails ? (
        <p className="loading-message">Đang tải chi tiết lớp học...</p>
      ) : classDetailsError ? (
        <p className="error-message">
          Đã có lỗi xảy ra: {classDetailsError.message}
        </p>
      ) : (
        <div className="form-group">
          <label htmlFor="class-select" className="form-label">
            Môn học:
          </label>
          <select
            id="class-select"
            className="select-input"
            value={selectedClassId || ""}
            onChange={(e) => handleClassSelect(parseInt(e.target.value))}
            disabled={
              !selectedSemester ||
              !classesForSelection ||
              classesForSelection.length === 0
            }>
            {!classesForSelection || classesForSelection.length === 0 ? (
              <option value="">Không có môn học nào</option>
            ) : (
              <>
                <option value="">--- Chọn môn học ---</option>
                {classesForSelection?.map((cls) => (
                  <option key={cls.value} value={cls.value}>
                    {cls.label}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
      )}
    </div>
  );
}
